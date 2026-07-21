"use client";

import Link from "next/link";
import { ONBOARDING_TEMPLATES } from "@conviyo/shared";
import { useI18n } from "../lib/i18n";
import { useAuth } from "../lib/auth-context";
import { LanguageSwitcher } from "../components/language-switcher";

const VALUE_PROPS = [
  {
    icon: "💬",
    title: "One inbox, every channel",
    body: "WhatsApp, Instagram, and Messenger conversations land in a single shared inbox your whole team can work from.",
  },
  {
    icon: "🤖",
    title: "An AI agent that actually sells",
    body: "Answers questions from your knowledge base, recommends products from your catalog, and creates the order — all inside the chat.",
  },
  {
    icon: "🤝",
    title: "Seamless human handoff",
    body: "When the AI can't help, or a customer asks for a person, the conversation hands off instantly with full context — no repeating themselves.",
  },
];

export default function LandingPage() {
  const { t } = useI18n();
  const { user } = useAuth();

  const featuredTemplates = ONBOARDING_TEMPLATES.filter((tpl) => tpl.id !== "general");

  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-xl font-bold text-brand-700">Conviyo</span>
        <div className="flex items-center gap-3">
          <LanguageSwitcher compact />
          {user ? (
            <Link href="/overview" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                {t("landing.hero.ctaSecondary")}
              </Link>
              <Link href="/signup" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                {t("landing.hero.ctaPrimary")}
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-24">
        <span className="inline-block rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
          {t("landing.badge")}
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{t("landing.hero.title")}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">{t("landing.hero.subtitle")}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-md bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-brand-700"
          >
            {t("landing.hero.ctaPrimary")}
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-slate-300 px-6 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            {t("landing.hero.ctaSecondary")}
          </Link>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 sm:grid-cols-3">
          {VALUE_PROPS.map((v) => (
            <div key={v.title} className="rounded-xl bg-white p-6 shadow-sm">
              <span className="text-3xl">{v.icon}</span>
              <h3 className="mt-3 font-semibold text-slate-900">{v.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900">{t("landing.usecases.title")}</h2>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredTemplates.map((tpl) => (
            <div key={tpl.id} className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{tpl.icon}</span>
                <div className="flex gap-1">
                  {tpl.regions.map((r) => (
                    <span key={r} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                      {r === "GLOBAL" ? "Global" : r}
                    </span>
                  ))}
                </div>
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">{tpl.label}</h3>
              <p className="mt-1 text-sm text-slate-600">{tpl.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-100 py-10">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-slate-500">
          <p className="font-semibold text-brand-700">Conviyo</p>
          <p className="mt-1">{t("landing.footer.tagline")}</p>
        </div>
      </footer>
    </div>
  );
}
