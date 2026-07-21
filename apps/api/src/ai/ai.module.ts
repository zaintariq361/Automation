import { Module } from "@nestjs/common";
import { CatalogModule } from "../catalog/catalog.module";
import { KnowledgeModule } from "../knowledge/knowledge.module";
import { OrdersModule } from "../orders/orders.module";
import { HandoffModule } from "../handoff/handoff.module";
import { AnthropicService } from "./anthropic.service";
import { AgentService } from "./agent.service";

@Module({
  imports: [CatalogModule, KnowledgeModule, OrdersModule, HandoffModule],
  providers: [AnthropicService, AgentService],
  exports: [AgentService],
})
export class AiModule {}
