import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Anthropic from "@anthropic-ai/sdk";
import { isConfiguredValue } from "../common/utils/is-configured";

@Injectable()
export class AnthropicService {
  private client: Anthropic | null = null;

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return isConfiguredValue(this.config.get<string>("ANTHROPIC_API_KEY"));
  }

  getClient(): Anthropic {
    if (!this.client) {
      this.client = new Anthropic({ apiKey: this.config.get<string>("ANTHROPIC_API_KEY") });
    }
    return this.client;
  }

  getModel(): string {
    return this.config.get<string>("ANTHROPIC_MODEL", "claude-sonnet-5");
  }
}
