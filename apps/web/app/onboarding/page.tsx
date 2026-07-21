"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ONBOARDING_TEMPLATES, LANGUAGE_LABELS, SUPPORTED_LANGUAGES, SupportedLanguage } from "@conviyo/shared";
import { useRequireAuth } from "../../lib/auth-context";
import { useI18n } from "../../lib/i18n";
import { useToast } from "../../lib/toast-context";
import { api, ApiError } from "../../lib/api";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ knowledgeDocs: number; products: number } | null>(null);

  if (authLoading || !user) {
    return <div className="flex h-screen items-center justify-center text-sm text-slate-500">{t("common.loading")}</div>;
  }

  const selectedTemplate = ONBOARDING_TEMPLATES.find((tpl) => tpl.id === templateId);

  function pickTemplate(id: string) {
    setTemplateId(id);
    const tpl = ONBOARDING_TEMPLATES.find((t2) => t2.id === id);
    if (tpl) setLanguage(tpl.defaultLanguage);
  }

  async function finish() {
    if (!templateId) return;
    setSubmitting(true);
    try {
      const res = await api.post<{ seeded: boolean; knowledgeDocs: number; products: number }>("/onboarding/complete", {
        templateId,
        defaultLanguage: language,
      });
      setResult(res);
      setStep(3);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Setup failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-brand-600" : "bg-slate-200"}`} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{t("onboarding.step1.title")}</h1>
            <p className="mt-1 text-sm text-slate-500">{t("onboarding.step1.subtitle")}</p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ONBOARDING_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => pickTemplate(tpl.id)}
                  className={`rounded-lg border p-4 text-left transition ${
                    templateId === tpl.id ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{tpl.icon}</span>
                    <div className="flex gap-1">
                      {tpl.regions.map((r) => (
                        <span key={r} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                          {r === "GLOBAL" ? "Global" : r}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 font-medium text-slate-900">{tpl.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{tpl.description}</p>
                </button>
              ))}
            </div>

            <button
              disabled={!templateId}
              onClick={() => setStep(2)}
              className="mt-6 w-full rounded-md bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-40"
            >
              {t("common.continue")}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{t("onboarding.step2.title")}</h1>
            <p className="mt-1 text-sm text-slate-500">{t("onboarding.step2.subtitle")}</p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {SUPPORTED_LANGUAGES.map((lng) => (
                <button
                  key={lng}
                  onClick={() => setLanguage(lng)}
                  className={`rounded-lg border p-4 text-center font-medium transition ${
                    language === lng ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {LANGUAGE_LABELS[lng]}
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-md border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {t("common.back")}
              </button>
              <button
                onClick={finish}
                disabled={submitting}
                className="flex-1 rounded-md bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {submitting ? t("common.loading") : t("common.finish")}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <span className="text-4xl">{selectedTemplate?.icon ?? "🎉"}</span>
            <h1 className="mt-3 text-xl font-semibold text-slate-900">{t("onboarding.step3.title")}</h1>
            <p className="mt-1 text-sm text-slate-500">{t("onboarding.step3.subtitle")}</p>

            {result && (
              <div className="mx-auto mt-6 max-w-xs space-y-2 text-left text-sm">
                <div className="flex justify-between rounded-md bg-slate-50 px-3 py-2">
                  <span className="text-slate-500">Knowledge base articles</span>
                  <span className="font-medium text-slate-900">{result.knowledgeDocs}</span>
                </div>
                <div className="flex justify-between rounded-md bg-slate-50 px-3 py-2">
                  <span className="text-slate-500">Sample products</span>
                  <span className="font-medium text-slate-900">{result.products}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => router.push("/overview")}
              className="mt-6 rounded-md bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              {t("common.getStarted")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
