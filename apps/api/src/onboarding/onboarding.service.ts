import { BadRequestException, Injectable } from "@nestjs/common";
import { ONBOARDING_TEMPLATES } from "@conviyo/shared";
import { PrismaService } from "../prisma/prisma.service";
import { KnowledgeService } from "../knowledge/knowledge.service";

@Injectable()
export class OnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly knowledge: KnowledgeService,
  ) {}

  listTemplates() {
    return ONBOARDING_TEMPLATES.map(({ id, label, regions, icon, description, defaultLanguage }) => ({
      id,
      label,
      regions,
      icon,
      description,
      defaultLanguage,
    }));
  }

  async status(tenantId: string) {
    const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
    return { onboarded: Boolean(tenant.onboardedAt), industry: tenant.industry, defaultLanguage: tenant.defaultLanguage };
  }

  async complete(tenantId: string, templateId: string, defaultLanguage?: string) {
    const template = ONBOARDING_TEMPLATES.find((t) => t.id === templateId);
    if (!template) throw new BadRequestException(`Unknown template ${templateId}`);

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        industry: template.id,
        defaultLanguage: defaultLanguage ?? template.defaultLanguage,
        onboardedAt: new Date(),
      },
    });

    for (const doc of template.knowledgeDocs) {
      await this.knowledge.createDocument(tenantId, doc.title, doc.sourceType, doc.content);
    }

    if (template.products.length > 0) {
      await this.prisma.product.createMany({
        data: template.products.map((p, i) => ({
          tenantId,
          externalId: `template-${template.id}-${i}`,
          title: p.title,
          description: p.description,
          price: p.price,
          currency: p.currency,
          inventory: p.inventory,
        })),
        skipDuplicates: true,
      });
    }

    return { seeded: true, knowledgeDocs: template.knowledgeDocs.length, products: template.products.length };
  }
}
