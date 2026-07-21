import { IsIn, IsOptional, IsString } from "class-validator";
import { ONBOARDING_TEMPLATES, SUPPORTED_LANGUAGES } from "@conviyo/shared";

const TEMPLATE_IDS = ONBOARDING_TEMPLATES.map((t) => t.id);

export class CompleteOnboardingDto {
  @IsString()
  @IsIn(TEMPLATE_IDS)
  templateId!: string;

  @IsOptional()
  @IsIn(SUPPORTED_LANGUAGES)
  defaultLanguage?: string;
}
