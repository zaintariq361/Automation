import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { CustomersService } from "./customers.service";

@UseGuards(JwtAuthGuard)
@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.customersService.list(user.tenantId);
  }

  @Get(":id")
  get(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.customersService.get(user.tenantId, id);
  }

  @Patch(":id/tags")
  tag(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body("tags") tags: string[],
  ) {
    return this.customersService.tag(user.tenantId, id, tags);
  }
}
