import { IsIn, IsString, MinLength } from "class-validator";

export const KNOWLEDGE_SOURCE_TYPES = ["faq", "policy", "product", "manual", "menu"] as const;

export class CreateDocumentDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsIn(KNOWLEDGE_SOURCE_TYPES)
  sourceType!: (typeof KNOWLEDGE_SOURCE_TYPES)[number];

  @IsString()
  @MinLength(1)
  content!: string;
}
