import { Module } from "@nestjs/common";
import { EngineModule } from "../engine/engine.module";
import { IntegrationsModule } from "../integrations/integrations.module";
import { ChannelsModule } from "../channels/channels.module";
import { WhatsappController } from "./whatsapp.controller";

@Module({
  imports: [EngineModule, IntegrationsModule, ChannelsModule],
  controllers: [WhatsappController],
})
export class WhatsappModule {}
