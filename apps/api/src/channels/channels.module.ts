import { Module } from "@nestjs/common";
import { IntegrationsModule } from "../integrations/integrations.module";
import { WhatsappClientService } from "./whatsapp-client.service";

@Module({
  imports: [IntegrationsModule],
  providers: [WhatsappClientService],
  exports: [WhatsappClientService],
})
export class ChannelsModule {}
