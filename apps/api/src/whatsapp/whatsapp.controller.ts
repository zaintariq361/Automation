import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Headers,
  Req,
  Res,
  HttpCode,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from "express";
import { EngineService } from "../engine/engine.service";
import { IntegrationsService } from "../integrations/integrations.service";
import { WhatsappClientService } from "../channels/whatsapp-client.service";
import { parseWhatsappWebhook } from "../channels/whatsapp-payload.types";

@Controller("webhooks/whatsapp")
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(
    private readonly engine: EngineService,
    private readonly config: ConfigService,
    private readonly integrations: IntegrationsService,
    private readonly whatsappClient: WhatsappClientService,
  ) {}

  /** Meta calls this once, at webhook setup time, to verify ownership. */
  @Get()
  verify(
    @Query("hub.mode") mode: string,
    @Query("hub.verify_token") token: string,
    @Query("hub.challenge") challenge: string,
    @Res() res: Response,
  ) {
    const expected = this.config.get<string>("WHATSAPP_VERIFY_TOKEN");
    if (mode === "subscribe" && token === expected) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send("Forbidden");
    }
  }

  @Post()
  @HttpCode(200)
  async receive(
    @Body() body: any,
    @Headers("x-hub-signature-256") signature: string | undefined,
    @Req() req: Request,
  ) {
    const messages = parseWhatsappWebhook(body);
    if (messages.length === 0) return { received: true };

    for (const message of messages) {
      const tenantId = await this.integrations.findTenantByWhatsappPhoneNumberId(message.phoneNumberId);
      if (!tenantId) {
        this.logger.warn(`Dropping WhatsApp payload for unknown phone_number_id ${message.phoneNumberId}`);
        continue;
      }

      const { appSecret } = await this.integrations.getWhatsappConfig(tenantId);
      const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
      if (appSecret && rawBody && !this.whatsappClient.verifySignature(appSecret, rawBody, signature)) {
        throw new UnauthorizedException("Invalid webhook signature");
      }
    }

    await this.engine.handleInboundWhatsappMessages(messages);
    return { received: true };
  }
}
