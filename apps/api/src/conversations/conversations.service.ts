import { Injectable, NotFoundException } from "@nestjs/common";
import { ConversationStatus, HandoffReason } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { HandoffService } from "../handoff/handoff.service";
import { EngineService } from "../engine/engine.service";

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly handoffService: HandoffService,
    private readonly engine: EngineService,
  ) {}

  list(tenantId: string, status?: ConversationStatus) {
    return this.prisma.conversation.findMany({
      where: { tenantId, ...(status ? { status } : {}) },
      include: { customer: true, assignedAgent: { select: { id: true, name: true } } },
      orderBy: { lastMessageAt: "desc" },
    });
  }

  async get(tenantId: string, id: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        assignedAgent: { select: { id: true, name: true } },
        messages: { orderBy: { createdAt: "asc" } },
        internalNotes: { orderBy: { createdAt: "desc" }, include: { author: { select: { id: true, name: true } } } },
      },
    });
    if (!conversation) throw new NotFoundException("Conversation not found");
    return conversation;
  }

  async assign(tenantId: string, id: string, agentId: string | null) {
    await this.ensureExists(tenantId, id);
    return this.prisma.conversation.update({
      where: { id },
      data: { assignedAgentId: agentId, status: agentId ? ConversationStatus.PENDING : ConversationStatus.OPEN },
    });
  }

  async close(tenantId: string, id: string) {
    await this.ensureExists(tenantId, id);
    return this.prisma.conversation.update({ where: { id }, data: { status: ConversationStatus.CLOSED } });
  }

  async reopen(tenantId: string, id: string) {
    await this.ensureExists(tenantId, id);
    return this.prisma.conversation.update({ where: { id }, data: { status: ConversationStatus.OPEN } });
  }

  async setAiEnabled(tenantId: string, id: string, aiEnabled: boolean) {
    await this.ensureExists(tenantId, id);
    return this.prisma.conversation.update({ where: { id }, data: { aiEnabled } });
  }

  async addNote(tenantId: string, id: string, authorId: string, content: string) {
    await this.ensureExists(tenantId, id);
    return this.prisma.internalNote.create({ data: { conversationId: id, authorId, content } });
  }

  async manualHandoff(tenantId: string, id: string, note?: string) {
    await this.ensureExists(tenantId, id);
    return this.handoffService.triggerHandoff(tenantId, id, HandoffReason.MANUAL, note);
  }

  async sendAgentMessage(tenantId: string, id: string, agentUserId: string, content: string) {
    await this.ensureExists(tenantId, id);
    return this.engine.sendAgentReply(tenantId, id, agentUserId, content);
  }

  private async ensureExists(tenantId: string, id: string) {
    const conversation = await this.prisma.conversation.findFirst({ where: { id, tenantId } });
    if (!conversation) throw new NotFoundException("Conversation not found");
    return conversation;
  }
}
