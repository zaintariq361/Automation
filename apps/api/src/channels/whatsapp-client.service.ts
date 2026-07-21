import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import * as crypto from "crypto";
import { IntegrationsService } from "../integrations/integrations.service";
import { isConfiguredValue } from "../common/utils/is-configured";

const GRAPH_API_BASE = "https://graph.facebook.com/v20.0";

@Injectable()
export class WhatsappClientService {
  private readonly logger = new Logger(WhatsappClientService.name);

  constructor(private readonly integrations: IntegrationsService) {}

  /**
   * Sends a WhatsApp text message. Never throws — a delivery failure (missing
   * credentials, Meta API error, network error) is logged and swallowed so it
   * can't take down the inbound-message pipeline that already persisted the
   * conversation; callers that care about delivery status get a boolean back.
   */
  async sendText(tenantId: string, toPhone: string, body: string): Promise<boolean> {
    const { accessToken, phoneNumberId } = await this.integrations.getWhatsappConfig(tenantId);

    if (!isConfiguredValue(accessToken) || !isConfiguredValue(phoneNumberId)) {
      this.logger.warn(
        `WhatsApp not configured for tenant ${tenantId} — skipping send. Would have sent to ${toPhone}: ${body}`,
      );
      return false;
    }

    try {
      await axios.post(
        `${GRAPH_API_BASE}/${phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to: toPhone,
          type: "text",
          text: { preview_url: false, body },
        },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      return true;
    } catch (err) {
      const message = axios.isAxiosError(err) ? JSON.stringify(err.response?.data) : String(err);
      this.logger.error(`Failed to send WhatsApp message to tenant ${tenantId}: ${message}`);
      return false;
    }
  }

  /** Verifies the X-Hub-Signature-256 header Meta signs webhook payloads with. */
  verifySignature(appSecret: string, rawBody: Buffer, signatureHeader?: string): boolean {
    if (!appSecret || !signatureHeader) return !appSecret; // allow through if no secret configured (dev mode)
    const expected =
      "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
    } catch {
      return false;
    }
  }
}
