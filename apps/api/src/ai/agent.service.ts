import { Injectable, Logger } from "@nestjs/common";
import Anthropic from "@anthropic-ai/sdk";
import { HandoffReason } from "@prisma/client";
import { ONBOARDING_TEMPLATES, LANGUAGE_LABELS, SupportedLanguage } from "@conviyo/shared";
import { AnthropicService } from "./anthropic.service";
import { AGENT_TOOLS } from "./tools/tool-definitions";
import { ProductsService } from "../catalog/products.service";
import { KnowledgeService } from "../knowledge/knowledge.service";
import { OrdersService, OrderItemInput } from "../orders/orders.service";
import { HandoffService } from "../handoff/handoff.service";
import { PrismaService } from "../prisma/prisma.service";

export interface AgentTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AgentContext {
  tenantId: string;
  tenantName: string;
  conversationId: string;
  customerId: string;
  currency: string;
  industry?: string | null;
  defaultLanguage?: string | null;
}

export interface AgentResult {
  text: string;
  handoffTriggered: boolean;
  orderCreated: boolean;
}

const MAX_TOOL_ITERATIONS = 5;
const FALLBACK_REPLY =
  "Thanks for your message! I'm not able to process that automatically right now — let me connect you with a member of our team.";

function buildSystemPrompt(ctx: AgentContext): string {
  const template = ctx.industry ? ONBOARDING_TEMPLATES.find((t) => t.id === ctx.industry) : undefined;
  const tone = template?.agentTone ?? "You're helpful, professional, and concise.";
  const languageLabel = LANGUAGE_LABELS[(ctx.defaultLanguage as SupportedLanguage) ?? "en"] ?? "English";

  return `You are the AI sales and support agent for ${ctx.tenantName}, operating inside a WhatsApp/Instagram/Messenger conversation.

Tone: ${tone}

Language: Default to ${languageLabel}, but if the customer writes in a different language, mirror their language instead — always match the customer.

Your job:
- Answer questions using the knowledge base (search_knowledge_base) and product catalog (search_catalog) tools — never invent product names, prices, or policies.
- Help the customer find and order products, using create_order only after they've explicitly confirmed items and quantities.
- Keep replies short, warm, and conversational — this is a chat, not an email.
- If you cannot help, or the customer asks for a human, or the request involves a complaint/refund, call handoff_to_human.
- Never claim to have taken an action (like creating an order) unless you actually called the corresponding tool.`;
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly anthropic: AnthropicService,
    private readonly products: ProductsService,
    private readonly knowledge: KnowledgeService,
    private readonly orders: OrdersService,
    private readonly handoff: HandoffService,
    private readonly prisma: PrismaService,
  ) {}

  async generateReply(ctx: AgentContext, history: AgentTurn[]): Promise<AgentResult> {
    if (!this.anthropic.isConfigured()) {
      this.logger.warn("ANTHROPIC_API_KEY not configured — returning fallback reply.");
      return { text: FALLBACK_REPLY, handoffTriggered: false, orderCreated: false };
    }

    const client = this.anthropic.getClient();
    const model = this.anthropic.getModel();

    const messages: Anthropic.MessageParam[] = history.map((turn) => ({
      role: turn.role,
      content: turn.content,
    }));

    let handoffTriggered = false;
    let orderCreated = false;

    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
      const response = await client.messages.create({
        model,
        max_tokens: 1024,
        system: buildSystemPrompt(ctx),
        tools: AGENT_TOOLS,
        messages,
      });

      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
      );

      if (response.stop_reason !== "tool_use" || toolUseBlocks.length === 0) {
        const text = response.content
          .filter((block): block is Anthropic.TextBlock => block.type === "text")
          .map((block) => block.text)
          .join("\n")
          .trim();
        return { text: text || FALLBACK_REPLY, handoffTriggered, orderCreated };
      }

      messages.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const toolUse of toolUseBlocks) {
        const result = await this.executeTool(ctx, toolUse.name, toolUse.input as Record<string, unknown>);
        if (toolUse.name === "handoff_to_human") handoffTriggered = true;
        if (toolUse.name === "create_order" && result.ok) orderCreated = true;

        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
          is_error: !result.ok,
        });
      }

      messages.push({ role: "user", content: toolResults });

      if (handoffTriggered) {
        return {
          text: "I've connected you with a member of our team — they'll be with you shortly!",
          handoffTriggered: true,
          orderCreated,
        };
      }
    }

    return { text: FALLBACK_REPLY, handoffTriggered, orderCreated };
  }

  private async executeTool(
    ctx: AgentContext,
    name: string,
    input: Record<string, unknown>,
  ): Promise<{ ok: boolean; data?: unknown; error?: string }> {
    try {
      switch (name) {
        case "search_catalog": {
          const products = await this.products.search(ctx.tenantId, {
            query: input.query as string | undefined,
            maxPrice: input.max_price as number | undefined,
            limit: 8,
          });
          return {
            ok: true,
            data: products.map((p) => ({
              id: p.id,
              title: p.title,
              price: p.price,
              currency: p.currency,
              inventory: p.inventory,
            })),
          };
        }

        case "search_knowledge_base": {
          const results = await this.knowledge.search(ctx.tenantId, (input.query as string) ?? "", 5);
          return { ok: true, data: results.map((r) => ({ content: r.content, relevance: r.score })) };
        }

        case "create_order": {
          const items = (input.items as Array<{ product_id: string; quantity: number }>) ?? [];
          const orderItems: OrderItemInput[] = [];
          for (const item of items) {
            const product = await this.prisma.product.findFirst({
              where: { id: item.product_id, tenantId: ctx.tenantId },
            });
            if (!product) return { ok: false, error: `Unknown product_id ${item.product_id}` };
            orderItems.push({
              productId: product.id,
              title: product.title,
              quantity: item.quantity,
              unitPrice: Number(product.price),
            });
          }
          if (orderItems.length === 0) return { ok: false, error: "No valid items provided" };

          const order = await this.orders.create(ctx.tenantId, ctx.customerId, orderItems, ctx.currency, ctx.conversationId);
          return { ok: true, data: { orderId: order.id, total: order.total, status: order.status } };
        }

        case "handoff_to_human": {
          await this.handoff.triggerHandoff(
            ctx.tenantId,
            ctx.conversationId,
            HandoffReason.AI_LOW_CONFIDENCE,
            input.reason as string | undefined,
          );
          return { ok: true, data: { handedOff: true } };
        }

        default:
          return { ok: false, error: `Unknown tool ${name}` };
      }
    } catch (err) {
      this.logger.error(`Tool ${name} failed: ${(err as Error).message}`);
      return { ok: false, error: (err as Error).message };
    }
  }
}
