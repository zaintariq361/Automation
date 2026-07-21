import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CustomersModule } from "./customers/customers.module";
import { IntegrationsModule } from "./integrations/integrations.module";
import { ChannelsModule } from "./channels/channels.module";
import { CatalogModule } from "./catalog/catalog.module";
import { KnowledgeModule } from "./knowledge/knowledge.module";
import { OrdersModule } from "./orders/orders.module";
import { HandoffModule } from "./handoff/handoff.module";
import { AiModule } from "./ai/ai.module";
import { EngineModule } from "./engine/engine.module";
import { WhatsappModule } from "./whatsapp/whatsapp.module";
import { ConversationsModule } from "./conversations/conversations.module";
import { AnalyticsModule } from "./analytics/analytics.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CustomersModule,
    IntegrationsModule,
    ChannelsModule,
    CatalogModule,
    KnowledgeModule,
    OrdersModule,
    HandoffModule,
    AiModule,
    EngineModule,
    WhatsappModule,
    ConversationsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
