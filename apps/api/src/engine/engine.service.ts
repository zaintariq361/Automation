import { Injectable, Logger } from "@nestjs/common";
import { Channel, ConversationStatus, HandoffReason, MessageSender, MessageType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CustomersService } from "../customers/customers.service";
import { IntegrationsService } from "../integrations/integrations.service";
import { WhatsappClientService } from "../channels/whatsapp-client.service";
import { AgentService, AgentTurn } from "../ai/agent.service";
import { HandoffService } from "../handoff/handoff.service";
import { WhatsappInboundMessage } from "../channels/whatsapp-payload.types";

const HISTORY_LIMIT = 20;

@Injectable()
export class EngineService {
  private readonly logger = new Logger(EngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly customers: CustomersService,
    private readonly integrations: IntegrationsService,
    private readonly whatsapp: WhatsappClientService,
    private readonly agent: AgentService,
    private readonly handoffService: HandoffService,
  ) {}

  async handleInboundWhatsappMessages(messages: WhatsappInboundMessage[]) {
    for (const message of messages) {
      const tenantId = await this.integrations.findTenantByWhatsappPhoneNumberId(message.phoneNumberId);
      if (!tenantId) {
        this.logger.warn(`No tenant found for WhatsApp phone_number_id ${message.phoneNumberId} — dropping message.`);
        continue;
      }
      await this.processInboundMessage(tenantId, Channel.WHATSAPP, message);
    }
  }

  private async processInboundMessage(tenantId: string, channel: Channel, message: WhatsappInboundMessage) {
    const customer = await this.customers.findOrCreateByChannel(
      tenantId,
      channel,
      message.from,
      message.customerName,
      message.from,
    );

    const conversation = await this.findOrCreateOpenConversation(tenantId, customer.id, channel);

    const content = message.text ?? `[${message.type} message received]`;
    await this.prisma.message.create({
      data: {
        tenantId,
        conversationId: conversation.id,
        sender: MessageSender.CUSTOMER,
        type: this.mapMessageType(message.type),
        content,
        metadata: { waMessageId: message.waMessageId, mediaId: message.mediaId },
      },
    });
    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    if (this.handoffService.detectEscalationKeyword(content) && conversation.status !== ConversationStatus.HANDED_OFF) {
      await this.handoffService.triggerHandoff(tenantId, conversation.id, HandoffReason.CUSTOMER_REQUESTED, "Customer used an escalation phrase.");
      await this.whatsapp.sendText(tenantId, customer.phone ?? customer.externalId, "I've connected you with a member of our team — they'll be with you shortly!");
      return;
    }

    if (!conversation.aiEnabled || conversation.status === ConversationStatus.HANDED_OFF) {
      return; // waiting on a human agent — no automated reply
    }

    await this.runAgentAndRespond(tenantId, conversation.id, customer.id, customer.externalId, channel);
  }

  private async runAgentAndRespond(
    tenantId: string,
    conversationId: string,
    customerId: string,
    destination: string,
    channel: Channel,
  ) {
    const [tenant, history] = await Promise.all([
      this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } }),
      this.getHistory(conversationId),
    ]);

    const result = await this.agent.generateReply(
      {
        tenantId,
        tenantName: tenant.name,
        conversationId,
        customerId,
        currency: "USD",
        industry: tenant.industry,
        defaultLanguage: tenant.defaultLanguage,
      },
      history,
    );

    await this.prisma.message.create({
      data: {
        tenantId,
        conversationId,
        sender: MessageSender.AI,
        type: MessageType.TEXT,
        content: result.text,
      },
    });
    await this.prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } });

    if (channel === Channel.WHATSAPP) {
      await this.whatsapp.sendText(tenantId, destination, result.text);
    }
  }

  /** Manual reply sent by a human agent from the dashboard. */
  async sendAgentReply(tenantId: string, conversationId: string, agentUserId: string, text: string) {
    const conversation = await this.prisma.conversation.findFirstOrThrow({
      where: { id: conversationId, tenantId },
      include: { customer: true },
    });

    const message = await this.prisma.message.create({
      data: {
        tenantId,
        conversationId,
        sender: MessageSender.AGENT,
        senderId: agentUserId,
        type: MessageType.TEXT,
        content: text,
      },
    });
    await this.prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } });

    if (conversation.channel === Channel.WHATSAPP) {
      await this.whatsapp.sendText(tenantId, conversation.customer.phone ?? conversation.customer.externalId, text);
    }

    return message;
  }

  private async findOrCreateOpenConversation(tenantId: string, customerId: string, channel: Channel) {
    const existing = await this.prisma.conversation.findFirst({
      where: { tenantId, customerId, channel, status: { not: ConversationStatus.CLOSED } },
      orderBy: { createdAt: "desc" },
    });
    if (existing) return existing;

    return this.prisma.conversation.create({
      data: { tenantId, customerId, channel, status: ConversationStatus.OPEN, aiEnabled: true },
    });
  }

  private async getHistory(conversationId: string): Promise<AgentTurn[]> {
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: HISTORY_LIMIT,
    });

    return messages
      .filter((m) => m.sender !== MessageSender.SYSTEM)
      .map((m) => ({
        role: m.sender === MessageSender.CUSTOMER ? ("user" as const) : ("assistant" as const),
        content: m.content,
      }));
  }

  private mapMessageType(type: WhatsappInboundMessage["type"]): MessageType {
    switch (type) {
      case "image":
        return MessageType.IMAGE;
      case "audio":
        return MessageType.AUDIO;
      default:
        return MessageType.TEXT;
    }
  }
}
