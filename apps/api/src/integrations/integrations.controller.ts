import { Body, Controller, Delete, Get, Param, ParseEnumPipe, Put, UseGuards } from "@nestjs/common";
import { IntegrationType } from "@prisma/client";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { IntegrationsService } from "./integrations.service";
import { UpsertIntegrationDto } from "./dto/upsert-integration.dto";

@UseGuards(JwtAuthGuard)
@Controller("integrations")
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.integrationsService.list(user.tenantId);
  }

  @Put(":type")
  upsert(
    @CurrentUser() user: AuthenticatedUser,
    @Param("type", new ParseEnumPipe(IntegrationType)) type: IntegrationType,
    @Body() dto: UpsertIntegrationDto,
  ) {
    return this.integrationsService.upsert(user.tenantId, type, dto.config);
  }

  @Delete(":type")
  disconnect(
    @CurrentUser() user: AuthenticatedUser,
    @Param("type", new ParseEnumPipe(IntegrationType)) type: IntegrationType,
  ) {
    return this.integrationsService.disconnect(user.tenantId, type);
  }
}
