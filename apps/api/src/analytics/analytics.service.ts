import { Injectable } from "@nestjs/common";
import { ConversationStatus, OrderStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(tenantId: string, since?: Date) {
    const from = since ?? new Date(Date.now() - THIRTY_DAYS_MS);

    const [totalConversations, activeConversations, handedOffConversations, ordersInPeriod, avgResponseTime] =
      await Promise.all([
        this.prisma.conversation.count({ where: { tenantId, createdAt: { gte: from } } }),
        this.prisma.conversation.count({
          where: { tenantId, status: { in: [ConversationStatus.OPEN, ConversationStatus.PENDING] } },
        }),
        this.prisma.conversation.count({
          where: { tenantId, createdAt: { gte: from }, handoffEvents: { some: {} } },
        }),
        this.prisma.order.findMany({
          where: { tenantId, createdAt: { gte: from } },
          select: { total: true, status: true, conversationId: true },
        }),
        this.averageResponseTimeSeconds(tenantId, from),
      ]);

    const revenueGenerated = ordersInPeriod
      .filter((o) => o.status === OrderStatus.CONFIRMED || o.status === OrderStatus.FULFILLED)
      .reduce((sum, o) => sum + Number(o.total), 0);

    const conversationsWithOrder = new Set(ordersInPeriod.map((o) => o.conversationId).filter(Boolean)).size;

    const aiResolutionRate = totalConversations === 0 ? 0 : 1 - handedOffConversations / totalConversations;
    const handoffRate = totalConversations === 0 ? 0 : handedOffConversations / totalConversations;
    const conversionRate = totalConversations === 0 ? 0 : conversationsWithOrder / totalConversations;

    return {
      conversationVolume: totalConversations,
      aiResolutionRate: round(aiResolutionRate),
      avgResponseTimeSeconds: Math.round(avgResponseTime),
      handoffRate: round(handoffRate),
      conversionRate: round(conversionRate),
      revenueGenerated: round(revenueGenerated),
      activeConversations,
    };
  }

  async volumeByDay(tenantId: string, since?: Date) {
    const from = since ?? new Date(Date.now() - THIRTY_DAYS_MS);
    return this.prisma.$queryRawUnsafe<Array<{ day: string; count: bigint }>>(
      `SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') as day, COUNT(*) as count
       FROM "conversations"
       WHERE "tenantId" = $1 AND "createdAt" >= $2
       GROUP BY 1 ORDER BY 1`,
      tenantId,
      from,
    );
  }

  private async averageResponseTimeSeconds(tenantId: string, since: Date): Promise<number> {
    const rows = await this.prisma.$queryRawUnsafe<Array<{ avg_seconds: number | null }>>(
      `SELECT AVG(response_time) as avg_seconds FROM (
         SELECT EXTRACT(EPOCH FROM (t."createdAt" - t.prev_created_at)) as response_time
         FROM (
           SELECT "createdAt", "sender", "conversationId",
                  LAG("createdAt") OVER (PARTITION BY "conversationId" ORDER BY "createdAt") as prev_created_at,
                  LAG("sender") OVER (PARTITION BY "conversationId" ORDER BY "createdAt") as prev_sender
           FROM "messages"
           WHERE "tenantId" = $1 AND "createdAt" >= $2
         ) t
         WHERE t."sender" IN ('AI', 'AGENT') AND t.prev_sender = 'CUSTOMER'
       ) resp
       WHERE response_time IS NOT NULL AND response_time >= 0`,
      tenantId,
      since,
    );
    return Number(rows[0]?.avg_seconds ?? 0);
  }
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
