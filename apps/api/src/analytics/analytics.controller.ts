import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { AnalyticsService } from "./analytics.service";

@UseGuards(JwtAuthGuard)
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("summary")
  summary(@CurrentUser() user: AuthenticatedUser, @Query("since") since?: string) {
    return this.analyticsService.summary(user.tenantId, since ? new Date(since) : undefined);
  }

  @Get("volume")
  volume(@CurrentUser() user: AuthenticatedUser, @Query("since") since?: string) {
    return this.analyticsService.volumeByDay(user.tenantId, since ? new Date(since) : undefined);
  }
}
