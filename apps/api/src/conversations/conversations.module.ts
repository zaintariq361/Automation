import { Module } from "@nestjs/common";
import { HandoffModule } from "../handoff/handoff.module";
import { EngineModule } from "../engine/engine.module";
import { ConversationsService } from "./conversations.service";
import { ConversationsController } from "./conversations.controller";

@Module({
  imports: [HandoffModule, EngineModule],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
