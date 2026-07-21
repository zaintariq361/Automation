export const SUPPORTED_LANGUAGES = ["en", "ur", "ar"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  ur: "اردو (Urdu)",
  ar: "العربية (Arabic)",
};

export const RTL_LANGUAGES: SupportedLanguage[] = ["ur", "ar"];
