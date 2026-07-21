"use client";

import { useI18n, LANGUAGE_LABELS, SUPPORTED_LANGUAGES, SupportedLanguage } from "../lib/i18n";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as SupportedLanguage)}
      className={`rounded-md border border-slate-300 bg-white text-slate-700 focus:border-brand-500 focus:outline-none ${
        compact ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"
      }`}
      aria-label="Language"
    >
      {SUPPORTED_LANGUAGES.map((lng) => (
        <option key={lng} value={lng}>
          {LANGUAGE_LABELS[lng]}
        </option>
      ))}
    </select>
  );
}
