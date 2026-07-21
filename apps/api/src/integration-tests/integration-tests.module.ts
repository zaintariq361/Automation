import { Module } from "@nestjs/common";
import { ChannelsModule } from "../channels/channels.module";
import { CatalogModule } from "../catalog/catalog.module";
import { IntegrationTestsController } from "./integration-tests.controller";

@Module({
  imports: [ChannelsModule, CatalogModule],
  controllers: [IntegrationTestsController],
})
export class IntegrationTestsModule {}
