"use client";

import { useEffect, useState, FormEvent } from "react";
import { IntegrationDTO } from "@conviyo/shared";
import { api } from "../../../../lib/api";

const INTEGRATIONS: Array<{
  type: string;
  label: string;
  fields: Array<{ key: string; label: string; placeholder?: string }>;
}> = [
  {
    type: "WHATSAPP",
    label: "WhatsApp Business (Meta Cloud API)",
    fields: [
      { key: "phoneNumberId", label: "Phone Number ID" },
      { key: "accessToken", label: "Access Token" },
      { key: "appSecret", label: "App Secret" },
    ],
  },
  {
    type: "SHOPIFY",
    label: "Shopify",
    fields: [
      { key: "storeDomain", label: "Store Domain", placeholder: "your-store.myshopify.com" },
      { key: "adminApiToken", label: "Admin API Access Token" },
    ],
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationDTO[]>([]);

  function load() {
    api.get<IntegrationDTO[]>("/integrations").then(setIntegrations);
  }

  useEffect(load, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Integrations</h1>
      <p className="mt-1 text-sm text-slate-500">Connect the channels and commerce platforms this workspace uses.</p>

      <div className="mt-6 space-y-4">
        {INTEGRATIONS.map((def) => (
          <IntegrationCard
            key={def.type}
            def={def}
            existing={integrations.find((i) => i.type === def.type)}
            onSaved={load}
          />
        ))}
      </div>
    </div>
  );
}

function IntegrationCard({
  def,
  existing,
  onSaved,
}: {
  def: (typeof INTEGRATIONS)[number];
  existing?: IntegrationDTO;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(
    () => (existing?.config as Record<string, string>) ?? {},
  );
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/integrations/${def.type}`, { config: values });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="font-medium text-slate-900">{def.label}</p>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            existing?.status === "CONNECTED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
          }`}
        >
          {existing?.status ?? "DISCONNECTED"}
        </span>
      </div>

      {def.fields.map((field) => (
        <div key={field.key} className="space-y-1">
          <label className="text-xs font-medium text-slate-600">{field.label}</label>
          <input
            value={values[field.key] ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
