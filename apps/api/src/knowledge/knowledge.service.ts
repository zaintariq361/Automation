import { Injectable, NotFoundException } from "@nestjs/common";
import * as crypto from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { EmbeddingService } from "./embedding.service";
import { chunkText } from "./chunk-text";

export interface KnowledgeSearchResult {
  id: string;
  documentId: string;
  content: string;
  score: number;
}

@Injectable()
export class KnowledgeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddings: EmbeddingService,
  ) {}

  async listDocuments(tenantId: string) {
    const documents = await this.prisma.knowledgeDocument.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { chunks: true } } },
    });
    return documents.map((d) => ({
      id: d.id,
      tenantId: d.tenantId,
      title: d.title,
      sourceType: d.sourceType,
      content: d.content,
      chunkCount: d._count.chunks,
      createdAt: d.createdAt,
    }));
  }

  async createDocument(tenantId: string, title: string, sourceType: string, content: string) {
    const document = await this.prisma.knowledgeDocument.create({
      data: { tenantId, title, sourceType, content },
    });

    const chunks = chunkText(content);
    const embeddings = await this.embeddings.embed(chunks);

    for (let i = 0; i < chunks.length; i++) {
      const id = crypto.randomUUID();
      const vectorLiteral = `[${embeddings[i].join(",")}]`;
      const tokenCount = Math.ceil(chunks[i].length / 4);
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO "knowledge_chunks" ("id","tenantId","documentId","content","embedding","tokenCount","createdAt")
         VALUES ($1, $2, $3, $4, $5::vector, $6, now())`,
        id,
        tenantId,
        document.id,
        chunks[i],
        vectorLiteral,
        tokenCount,
      );
    }

    return { ...document, chunkCount: chunks.length };
  }

  async deleteDocument(tenantId: string, id: string) {
    const doc = await this.prisma.knowledgeDocument.findFirst({ where: { id, tenantId } });
    if (!doc) throw new NotFoundException("Knowledge document not found");
    await this.prisma.knowledgeDocument.delete({ where: { id } });
    return { deleted: true };
  }

  async search(tenantId: string, query: string, topK = 5): Promise<KnowledgeSearchResult[]> {
    const [queryEmbedding] = await this.embeddings.embed([query]);
    const vectorLiteral = `[${queryEmbedding.join(",")}]`;

    return this.prisma.$queryRawUnsafe<KnowledgeSearchResult[]>(
      `SELECT "id", "documentId", "content", 1 - ("embedding" <=> $1::vector) AS score
       FROM "knowledge_chunks"
       WHERE "tenantId" = $2
       ORDER BY "embedding" <=> $1::vector
       LIMIT $3`,
      vectorLiteral,
      tenantId,
      topK,
    );
  }
}
