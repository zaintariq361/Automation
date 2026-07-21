import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { isConfiguredValue } from "../common/utils/is-configured";

const VOYAGE_EMBEDDINGS_URL = "https://api.voyageai.com/v1/embeddings";
export const EMBEDDING_DIMENSIONS = 1024;

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Embeds a batch of text chunks via Voyage AI (Anthropic's recommended
   * embeddings partner — Claude itself has no native embeddings endpoint).
   * Falls back to a deterministic local hash-embedding when no API key is
   * configured, so the RAG pipeline still runs end-to-end in a dev/demo
   * environment without external credentials.
   */
  async embed(texts: string[]): Promise<number[][]> {
    const apiKey = this.config.get<string>("VOYAGE_API_KEY");
    if (!isConfiguredValue(apiKey)) {
      this.logger.warn("VOYAGE_API_KEY not configured — using local fallback embeddings (dev only).");
      return texts.map((t) => this.fallbackEmbed(t));
    }

    const response = await axios.post(
      VOYAGE_EMBEDDINGS_URL,
      { input: texts, model: this.config.get<string>("ANTHROPIC_EMBEDDING_MODEL", "voyage-3") },
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );
    return response.data.data.map((d: { embedding: number[] }) => d.embedding);
  }

  /** Deterministic bag-of-hashed-tokens vector — not semantically strong, but keeps the pipeline runnable offline. */
  private fallbackEmbed(text: string): number[] {
    const vector = new Array(EMBEDDING_DIMENSIONS).fill(0);
    const tokens = text.toLowerCase().split(/\W+/).filter(Boolean);
    for (const token of tokens) {
      let hash = 0;
      for (let i = 0; i < token.length; i++) {
        hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
      }
      vector[hash % EMBEDDING_DIMENSIONS] += 1;
    }
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vector.map((v) => v / norm);
  }
}
