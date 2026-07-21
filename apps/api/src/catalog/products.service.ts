import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ShopifyClientService } from "./shopify-client.service";

export interface ProductSearchParams {
  query?: string;
  maxPrice?: number;
  limit?: number;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly shopify: ShopifyClientService,
  ) {}

  list(tenantId: string) {
    return this.prisma.product.findMany({ where: { tenantId }, orderBy: { title: "asc" } });
  }

  search(tenantId: string, params: ProductSearchParams) {
    const where: Prisma.ProductWhereInput = { tenantId };

    if (params.query) {
      where.OR = [
        { title: { contains: params.query, mode: "insensitive" } },
        { description: { contains: params.query, mode: "insensitive" } },
      ];
    }
    if (params.maxPrice != null) {
      where.price = { lte: params.maxPrice };
    }

    return this.prisma.product.findMany({
      where,
      take: params.limit ?? 10,
      orderBy: { title: "asc" },
    });
  }

  async syncFromShopify(tenantId: string) {
    const products = await this.shopify.fetchProducts(tenantId);
    let synced = 0;

    for (const product of products) {
      const variant = product.variants?.[0];
      await this.prisma.product.upsert({
        where: { tenantId_externalId: { tenantId, externalId: String(product.id) } },
        create: {
          tenantId,
          externalId: String(product.id),
          title: product.title,
          description: product.body_html,
          price: variant ? Number(variant.price) : 0,
          imageUrl: product.image?.src ?? null,
          inventory: variant?.inventory_quantity ?? 0,
          variants: product.variants as unknown as Prisma.InputJsonValue,
        },
        update: {
          title: product.title,
          description: product.body_html,
          price: variant ? Number(variant.price) : 0,
          imageUrl: product.image?.src ?? null,
          inventory: variant?.inventory_quantity ?? 0,
          variants: product.variants as unknown as Prisma.InputJsonValue,
          syncedAt: new Date(),
        },
      });
      synced += 1;
    }

    this.logger.log(`Synced ${synced} products for tenant ${tenantId}`);
    return { synced };
  }
}
