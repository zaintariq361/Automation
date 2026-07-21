import { BadRequestException, Controller, Param, ParseEnumPipe, Post, UseGuards } from "@nestjs/common";
import { IntegrationType } from "@prisma/client";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { WhatsappClientService } from "../channels/whatsapp-client.service";
import { ShopifyClientService } from "../catalog/shopify-client.service";

@UseGuards(JwtAuthGuard)
@Controller("integrations")
export class IntegrationTestsController {
  constructor(
    private readonly whatsapp: WhatsappClientService,
    private readonly shopify: ShopifyClientService,
  ) {}

  @Post(":type/test")
  test(
    @CurrentUser() user: AuthenticatedUser,
    @Param("type", new ParseEnumPipe(IntegrationType)) type: IntegrationType,
  ) {
    switch (type) {
      case IntegrationType.WHATSAPP:
        return this.whatsapp.testConnection(user.tenantId);
      case IntegrationType.SHOPIFY:
        return this.shopify.testConnection(user.tenantId);
      default:
        throw new BadRequestException(`No connection test available for ${type} yet.`);
    }
  }
}
