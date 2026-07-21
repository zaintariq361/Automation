"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnalyticsSummaryDTO, IntegrationDTO, ProductDTO, KnowledgeDocumentDTO, UserDTO } from "@conviyo/shared";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";
import { useI18n } from "../../../lib/i18n";

interface ChecklistItem {
  key: string;
  labelKey: string;
  href: string;
  done: boolean;
}

export default function OverviewPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [summary, setSummary] = useState<AnalyticsSummaryDTO | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[] | null>(null);

  useEffect(() => {
    api.get<AnalyticsSummaryDTO>("/analytics/summary").then(setSummary);

    Promise.all([
      api.get<IntegrationDTO[]>("/integrations"),
      api.get<ProductDTO[]>("/catalog/products"),
      api.get<KnowledgeDocumentDTO[]>("/knowledge/documents"),
      api.get<UserDTO[]>("/users"),
    ]).then(([integrations, products, docs, users]) => {
      setChecklist([
        {
          key: "whatsapp",
          labelKey: "overview.checklist.whatsapp",
          href: "/settings/integrations",
          done: integrations.some((i) => i.type === "WHATSAPP" && i.status === "CONNECTED"),
        },
        { key: "products", labelKey: "overview.checklist.products", href: "/catalog", done: products.length > 0 },
        { key: "knowledge", labelKey: "overview.checklist.knowledge", href: "/knowledge-base", done: docs.length > 0 },
        { key: "team", labelKey: "overview.checklist.team", href: "/settings/team", done: users.length > 1 },
      ]);
    });
  }, []);

  const doneCount = checklist?.filter((c) => c.done).length ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">{t("overview.title")}</h1>
      <p className="mt-1 text-sm text-slate-500">Welcome back{user ? `, ${user.email}` : ""}.</p>

      {checklist && doneCount < checklist.length && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">{t("overview.checklist.title")}</h2>
            <span className="text-xs font-medium text-slate-500">
              {doneCount}/{checklist.length}
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100">
            <div
              className="h-1.5 rounded-full bg-brand-600 transition-all"
              style={{ width: `${(doneCount / checklist.length) * 100}%` }}
            />
          </div>
          <ul className="mt-4 space-y-2">
            {checklist.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-between rounded-md border px-4 py-3 text-sm transition ${
                    item.done ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                        item.done ? "bg-emerald-500 text-white" : "border border-slate-300 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    {t(item.labelKey)}
                  </span>
                  {!item.done && <span className="text-xs text-brand-600">{t("common.getStarted")} →</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Active conversations" value={summary.activeConversations.toString()} />
          <StatCard label="AI resolution rate" value={`${Math.round(summary.aiResolutionRate * 100)}%`} />
          <StatCard label="Revenue generated (30d)" value={`$${summary.revenueGenerated.toLocaleString()}`} />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
