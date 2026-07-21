"use client";

import { useEffect, useState } from "react";
import { AnalyticsSummaryDTO } from "@conviyo/shared";
import { api } from "../../../lib/api";

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummaryDTO | null>(null);

  useEffect(() => {
    api.get<AnalyticsSummaryDTO>("/analytics/summary").then(setSummary);
  }, []);

  if (!summary) return <div className="p-8 text-sm text-slate-500">Loading…</div>;

  const cards: Array<{ label: string; value: string }> = [
    { label: "Conversation volume (30d)", value: summary.conversationVolume.toString() },
    { label: "Active conversations", value: summary.activeConversations.toString() },
    { label: "AI resolution rate", value: formatPercent(summary.aiResolutionRate) },
    { label: "Handoff rate", value: formatPercent(summary.handoffRate) },
    { label: "Conversion rate", value: formatPercent(summary.conversionRate) },
    { label: "Avg. response time", value: formatSeconds(summary.avgResponseTimeSeconds) },
    { label: "Revenue generated (30d)", value: `$${summary.revenueGenerated.toLocaleString()}` },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
      <p className="mt-1 text-sm text-slate-500">Last 30 days, tied directly to revenue and resolution.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{c.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatPercent(v: number): string {
  return `${Math.round(v * 100)}%`;
}

function formatSeconds(v: number): string {
  if (v < 60) return `${v}s`;
  return `${Math.round(v / 60)}m`;
}
