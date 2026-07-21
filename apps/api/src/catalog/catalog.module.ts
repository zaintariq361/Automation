import { Module } from "@nestjs/common";
import { IntegrationsModule } from "../integrations/integrations.module";
import { ShopifyClientService } from "./shopify-client.service";
import { ProductsService } from "./products.service";
import { CatalogController } from "./catalog.controller";

@Module({
  imports: [IntegrationsModule],
  controllers: [CatalogController],
  providers: [ShopifyClientService, ProductsService],
  exports: [ProductsService, ShopifyClientService],
})
export class CatalogModule {}
