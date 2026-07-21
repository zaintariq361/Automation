import { IsIn, IsOptional, IsString, MinLength } from "class-validator";
import { SUPPORTED_LANGUAGES } from "@conviyo/shared";

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsIn(SUPPORTED_LANGUAGES)
  defaultLanguage?: string;
}
