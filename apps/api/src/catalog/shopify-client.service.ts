import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { IntegrationsService } from "../integrations/integrations.service";
import { isConfiguredValue } from "../common/utils/is-configured";

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

    if (!isConfiguredValue(storeDomain) || !isConfiguredValue(adminApiToken)) {
      this.logger.warn(`Shopify not configured for tenant ${tenantId} — skipping sync.`);
      return [];
    }

    const url = `https://${storeDomain}/admin/api/${apiVersion}/products.json?limit=250`;
    const response = await axios.get(url, {
      headers: { "X-Shopify-Access-Token": adminApiToken },
    });
    return response.data?.products ?? [];
  }

  /** Live credential check used by the "Test connection" button in Settings. */
  async testConnection(tenantId: string): Promise<{ ok: boolean; message: string }> {
    const { storeDomain, adminApiToken, apiVersion } = await this.integrations.getShopifyConfig(tenantId);

    if (!isConfiguredValue(storeDomain) || !isConfiguredValue(adminApiToken)) {
      return { ok: false, message: "Missing store domain or admin API token." };
    }

    try {
      const response = await axios.get(`https://${storeDomain}/admin/api/${apiVersion}/shop.json`, {
        headers: { "X-Shopify-Access-Token": adminApiToken },
      });
      return { ok: true, message: `Connected to ${response.data?.shop?.name ?? storeDomain}.` };
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.errors ?? err.message : String(err);
      return { ok: false, message: typeof message === "string" ? message : JSON.stringify(message) };
    }
  }
}
