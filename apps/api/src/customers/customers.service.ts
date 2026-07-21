import { Injectable, NotFoundException } from "@nestjs/common";
import { Channel } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.customer.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
  }

  async get(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({ where: { id, tenantId } });
    if (!customer) throw new NotFoundException("Customer not found");
    return customer;
  }

  async findOrCreateByChannel(
    tenantId: string,
    channel: Channel,
    externalId: string,
    name?: string,
    phone?: string,
  ) {
    const existing = await this.prisma.customer.findUnique({
      where: { tenantId_channel_externalId: { tenantId, channel, externalId } },
    });
    if (existing) return existing;

    return this.prisma.customer.create({
      data: { tenantId, channel, externalId, name, phone },
    });
  }

  async tag(tenantId: string, id: string, tags: string[]) {
    await this.get(tenantId, id);
    return this.prisma.customer.update({ where: { id }, data: { tags } });
  }
}
