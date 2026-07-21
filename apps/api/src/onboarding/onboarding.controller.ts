import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { OnboardingService } from "./onboarding.service";
import { CompleteOnboardingDto } from "./dto/complete-onboarding.dto";

@Controller("onboarding")
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get("templates")
  listTemplates() {
    return this.onboardingService.listTemplates();
  }

  @UseGuards(JwtAuthGuard)
  @Get("status")
  status(@CurrentUser() user: AuthenticatedUser) {
    return this.onboardingService.status(user.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("complete")
  complete(@CurrentUser() user: AuthenticatedUser, @Body() dto: CompleteOnboardingDto) {
    return this.onboardingService.complete(user.tenantId, dto.templateId, dto.defaultLanguage);
  }
}
