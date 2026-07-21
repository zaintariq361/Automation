import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { KnowledgeService } from "./knowledge.service";
import { CreateDocumentDto } from "./dto/create-document.dto";

@UseGuards(JwtAuthGuard)
@Controller("knowledge")
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get("documents")
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.knowledgeService.listDocuments(user.tenantId);
  }

  @Post("documents")
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateDocumentDto) {
    return this.knowledgeService.createDocument(user.tenantId, dto.title, dto.sourceType, dto.content);
  }

  @Delete("documents/:id")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.knowledgeService.deleteDocument(user.tenantId, id);
  }

  @Get("search")
  search(@CurrentUser() user: AuthenticatedUser, @Query("q") q: string) {
    return this.knowledgeService.search(user.tenantId, q ?? "");
  }
}
