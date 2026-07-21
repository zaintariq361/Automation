"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ConversationDTO } from "@conviyo/shared";
import { api } from "../../../lib/api";

export default function InboxPage() {
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ConversationDTO[]>("/conversations")
      .then(setConversations)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Inbox</h1>
      <p className="mt-1 text-sm text-slate-500">Conversations across WhatsApp, Instagram, and Messenger.</p>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading…</p>
        ) : conversations.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            No conversations yet. Once your WhatsApp integration is connected, incoming messages will show up here.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {conversations.map((c) => (
              <li key={c.id}>
                <Link href={`/inbox/${c.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {c.customer?.name || c.customer?.phone || "Unknown customer"}
                    </p>
                    <p className="text-xs text-slate-500">{c.channel}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <StatusBadge status={c.status} />
                    {c.aiEnabled && <span className="rounded-full bg-brand-50 px-2 py-1 font-medium text-brand-700">AI</span>}
                    <span className="text-slate-400">
                      {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleString() : ""}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OPEN: "bg-emerald-50 text-emerald-700",
    PENDING: "bg-amber-50 text-amber-700",
    HANDED_OFF: "bg-purple-50 text-purple-700",
    CLOSED: "bg-slate-100 text-slate-500",
  };
  return <span className={`rounded-full px-2 py-1 font-medium ${styles[status] ?? ""}`}>{status}</span>;
}
