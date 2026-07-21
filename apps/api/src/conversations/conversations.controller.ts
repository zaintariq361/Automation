import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ConversationStatus } from "@prisma/client";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { ConversationsService } from "./conversations.service";
import { SendMessageDto } from "./dto/send-message.dto";
import { AddNoteDto } from "./dto/add-note.dto";

@UseGuards(JwtAuthGuard)
@Controller("conversations")
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query("status") status?: ConversationStatus) {
    return this.conversationsService.list(user.tenantId, status);
  }

  @Get(":id")
  get(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.conversationsService.get(user.tenantId, id);
  }

  @Post(":id/messages")
  sendMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.conversationsService.sendAgentMessage(user.tenantId, id, user.userId, dto.content);
  }

  @Post(":id/notes")
  addNote(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: AddNoteDto) {
    return this.conversationsService.addNote(user.tenantId, id, user.userId, dto.content);
  }

  @Patch(":id/assign")
  assign(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body("agentId") agentId: string | null) {
    return this.conversationsService.assign(user.tenantId, id, agentId ?? null);
  }

  @Patch(":id/ai-enabled")
  setAiEnabled(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body("aiEnabled") aiEnabled: boolean,
  ) {
    return this.conversationsService.setAiEnabled(user.tenantId, id, aiEnabled);
  }

  @Patch(":id/close")
  close(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.conversationsService.close(user.tenantId, id);
  }

  @Patch(":id/reopen")
  reopen(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.conversationsService.reopen(user.tenantId, id);
  }

  @Post(":id/handoff")
  handoff(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body("note") note?: string) {
    return this.conversationsService.manualHandoff(user.tenantId, id, note);
  }
}
