import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  get(tenantId: string) {
    return this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
  }

  update(tenantId: string, data: { name?: string; industry?: string; defaultLanguage?: string }) {
    return this.prisma.tenant.update({ where: { id: tenantId }, data });
  }
}
