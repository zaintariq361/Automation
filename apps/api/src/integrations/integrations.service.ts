import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IntegrationType, IntegrationStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  list(tenantId: string) {
    return this.prisma.integration.findMany({ where: { tenantId } });
  }

  async get(tenantId: string, type: IntegrationType) {
    return this.prisma.integration.findUnique({
      where: { tenantId_type: { tenantId, type } },
    });
  }

  async upsert(tenantId: string, type: IntegrationType, config: Record<string, unknown>) {
    return this.prisma.integration.upsert({
      where: { tenantId_type: { tenantId, type } },
      create: { tenantId, type, config: config as Prisma.InputJsonValue, status: IntegrationStatus.CONNECTED },
      update: { config: config as Prisma.InputJsonValue, status: IntegrationStatus.CONNECTED },
    });
  }

  async disconnect(tenantId: string, type: IntegrationType) {
    const existing = await this.get(tenantId, type);
    if (!existing) throw new NotFoundException("Integration not configured");
    return this.prisma.integration.update({
      where: { tenantId_type: { tenantId, type } },
      data: { status: IntegrationStatus.DISCONNECTED },
    });
  }

  /**
   * WhatsApp config resolution: per-tenant Integration record takes priority;
   * falls back to process env so a single demo tenant works out of the box.
   */
  async getWhatsappConfig(tenantId: string) {
    const integration = await this.get(tenantId, IntegrationType.WHATSAPP);
    const cfg = (integration?.config ?? {}) as Record<string, string>;
    return {
      accessToken: cfg.accessToken ?? this.config.get<string>("WHATSAPP_ACCESS_TOKEN", ""),
      phoneNumberId: cfg.phoneNumberId ?? this.config.get<string>("WHATSAPP_PHONE_NUMBER_ID", ""),
      appSecret: cfg.appSecret ?? this.config.get<string>("WHATSAPP_APP_SECRET", ""),
    };
  }

  async getShopifyConfig(tenantId: string) {
    const integration = await this.get(tenantId, IntegrationType.SHOPIFY);
    const cfg = (integration?.config ?? {}) as Record<string, string>;
    return {
      storeDomain: cfg.storeDomain ?? this.config.get<string>("SHOPIFY_STORE_DOMAIN", ""),
      adminApiToken: cfg.adminApiToken ?? this.config.get<string>("SHOPIFY_ADMIN_API_TOKEN", ""),
      apiVersion: cfg.apiVersion ?? this.config.get<string>("SHOPIFY_API_VERSION", "2024-10"),
    };
  }

  /** Resolve which tenant owns a given inbound WhatsApp phone_number_id. */
  async findTenantByWhatsappPhoneNumberId(phoneNumberId: string) {
    const integration = await this.prisma.integration.findFirst({
      where: {
        type: IntegrationType.WHATSAPP,
        config: { path: ["phoneNumberId"], equals: phoneNumberId },
      },
    });
    if (integration) return integration.tenantId;

    // Demo fallback: single-tenant deployments configured purely via env vars.
    if (phoneNumberId && phoneNumberId === this.config.get<string>("WHATSAPP_PHONE_NUMBER_ID")) {
      const firstTenant = await this.prisma.tenant.findFirst({ orderBy: { createdAt: "asc" } });
      return firstTenant?.id ?? null;
    }
    return null;
  }
}
