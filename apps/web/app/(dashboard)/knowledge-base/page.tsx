"use client";

import { useEffect, useState, FormEvent } from "react";
import { KnowledgeDocumentDTO } from "@conviyo/shared";
import { api } from "../../../lib/api";

const SOURCE_TYPES = ["faq", "policy", "product", "manual", "menu"];

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<KnowledgeDocumentDTO[]>([]);
  const [title, setTitle] = useState("");
  const [sourceType, setSourceType] = useState("faq");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    api.get<KnowledgeDocumentDTO[]>("/knowledge/documents").then(setDocuments);
  }

  useEffect(load, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/knowledge/documents", { title, sourceType, content });
      setTitle("");
      setContent("");
      load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    await api.delete(`/knowledge/documents/${id}`);
    load();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Knowledge Base</h1>
      <p className="mt-1 text-sm text-slate-500">
        FAQs, policies, and product info the AI agent uses to answer customers (RAG over pgvector).
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3 rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex gap-3">
          <input
            required
            placeholder="Document title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          >
            {SOURCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <textarea
          required
          placeholder="Paste the FAQ / policy / menu content here…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Embedding…" : "Add document"}
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <p className="font-medium text-slate-900">{doc.title}</p>
              <p className="text-xs text-slate-500">
                {doc.sourceType} · {doc.chunkCount} chunks
              </p>
            </div>
            <button onClick={() => remove(doc.id)} className="text-xs font-medium text-red-600 hover:underline">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
