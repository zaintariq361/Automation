import { IsObject } from "class-validator";

export class UpsertIntegrationDto {
  @IsObject()
  config!: Record<string, unknown>;
}
