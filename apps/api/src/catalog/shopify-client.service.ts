import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { IntegrationsService } from "../integrations/integrations.service";

interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string | null;
  image: { src: string } | null;
  variants: Array<{
    id: number;
    price: string;
    inventory_quantity: number;
  }>;
}

@Injectable()
export class ShopifyClientService {
  private readonly logger = new Logger(ShopifyClientService.name);

  constructor(private readonly integrations: IntegrationsService) {}

  async fetchProducts(tenantId: string): Promise<ShopifyProduct[]> {
    const { storeDomain, adminApiToken, apiVersion } = await this.integrations.getShopifyConfig(tenantId);

    if (!storeDomain || !adminApiToken) {
      this.logger.warn(`Shopify not configured for tenant ${tenantId} — skipping sync.`);
      return [];
    }

    const url = `https://${storeDomain}/admin/api/${apiVersion}/products.json?limit=250`;
    const response = await axios.get(url, {
      headers: { "X-Shopify-Access-Token": adminApiToken },
    });
    return response.data?.products ?? [];
  }
}
