import { Module } from "@nestjs/common";
import { CustomersModule } from "../customers/customers.module";
import { IntegrationsModule } from "../integrations/integrations.module";
import { ChannelsModule } from "../channels/channels.module";
import { AiModule } from "../ai/ai.module";
import { HandoffModule } from "../handoff/handoff.module";
import { EngineService } from "./engine.service";

@Module({
  imports: [CustomersModule, IntegrationsModule, ChannelsModule, AiModule, HandoffModule],
  providers: [EngineService],
  exports: [EngineService],
})
export class EngineModule {}
