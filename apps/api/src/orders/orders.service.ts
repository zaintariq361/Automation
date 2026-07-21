import { Injectable, NotFoundException } from "@nestjs/common";
import { OrderStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface OrderItemInput {
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.order.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    });
  }

  async get(tenantId: string, id: string) {
    const order = await this.prisma.order.findFirst({ where: { id, tenantId }, include: { customer: true } });
    if (!order) throw new NotFoundException("Order not found");
    return order;
  }

  async create(
    tenantId: string,
    customerId: string,
    items: OrderItemInput[],
    currency: string,
    conversationId?: string,
  ) {
    const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    return this.prisma.order.create({
      data: {
        tenantId,
        customerId,
        conversationId,
        items: items as unknown as Prisma.InputJsonValue,
        total,
        currency,
        status: OrderStatus.PENDING_PAYMENT,
      },
    });
  }

  async updateStatus(tenantId: string, id: string, status: OrderStatus) {
    await this.get(tenantId, id);
    return this.prisma.order.update({ where: { id }, data: { status } });
  }

  async findLatestForConversation(tenantId: string, conversationId: string) {
    return this.prisma.order.findFirst({
      where: { tenantId, conversationId },
      orderBy: { createdAt: "desc" },
    });
  }
}
