"use client";

import { useEffect, useState, FormEvent } from "react";
import { KnowledgeDocumentDTO } from "@conviyo/shared";
import { api, ApiError } from "../../../lib/api";
import { useToast } from "../../../lib/toast-context";

const SOURCE_TYPES = ["faq", "policy", "product", "manual", "menu"];

export default function KnowledgeBasePage() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<KnowledgeDocumentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [sourceType, setSourceType] = useState("faq");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    api
      .get<KnowledgeDocumentDTO[]>("/knowledge/documents")
      .then(setDocuments)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/knowledge/documents", { title, sourceType, content });
      setTitle("");
      setContent("");
      toast("Document added and embedded.", "success");
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to add document", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      await api.delete(`/knowledge/documents/${id}`);
      toast("Document deleted.", "success");
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to delete document", "error");
    }
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
        {loading ? (
          [1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />)
        ) : documents.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center">
            <p className="text-3xl">📚</p>
            <p className="mt-2 font-medium text-slate-900">No documents yet</p>
            <p className="mt-1 text-sm text-slate-500">Add your first FAQ or policy above so the AI agent can answer from it.</p>
          </div>
        ) : (
          documents.map((doc) => (
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
          ))
        )}
      </div>
    </div>
  );
}
