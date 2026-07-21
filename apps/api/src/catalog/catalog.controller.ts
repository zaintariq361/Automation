import { Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { ProductsService } from "./products.service";

@UseGuards(JwtAuthGuard)
@Controller("catalog")
export class CatalogController {
  constructor(private readonly productsService: ProductsService) {}

  @Get("products")
  list(@CurrentUser() user: AuthenticatedUser, @Query("q") q?: string) {
    if (q) return this.productsService.search(user.tenantId, { query: q });
    return this.productsService.list(user.tenantId);
  }

  @Post("shopify/sync")
  sync(@CurrentUser() user: AuthenticatedUser) {
    return this.productsService.syncFromShopify(user.tenantId);
  }
}
