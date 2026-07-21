import { Injectable } from "@nestjs/common";
import { ConversationStatus, HandoffReason } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const ESCALATION_KEYWORDS = [
  "speak to a human",
  "talk to a person",
  "agent please",
  "human agent",
  "manager",
  "complaint",
  "refund",
];

@Injectable()
export class HandoffService {
  constructor(private readonly prisma: PrismaService) {}

  detectEscalationKeyword(text: string): boolean {
    const lower = text.toLowerCase();
    return ESCALATION_KEYWORDS.some((kw) => lower.includes(kw));
  }

  async triggerHandoff(
    tenantId: string,
    conversationId: string,
    reason: HandoffReason,
    note?: string,
  ) {
    const [conversation] = await this.prisma.$transaction([
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { status: ConversationStatus.HANDED_OFF, aiEnabled: false },
      }),
      this.prisma.handoffEvent.create({
        data: { conversationId, reason, fromAi: true, note },
      }),
      this.prisma.message.create({
        data: {
          tenantId,
          conversationId,
          sender: "SYSTEM",
          type: "TEXT",
          content: "Conversation handed off to a human agent.",
          metadata: { reason },
        },
      }),
    ]);
    return conversation;
  }

  listEvents(conversationId: string) {
    return this.prisma.handoffEvent.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
    });
  }
}
