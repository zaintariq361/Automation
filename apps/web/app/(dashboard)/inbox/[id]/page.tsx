"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { useParams } from "next/navigation";
import { MessageSender } from "@conviyo/shared";
import { api } from "../../../../lib/api";
import { useAuth } from "../../../../lib/auth-context";

interface Message {
  id: string;
  sender: MessageSender;
  content: string;
  createdAt: string;
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string };
}

interface ConversationDetail {
  id: string;
  status: string;
  aiEnabled: boolean;
  channel: string;
  customer: { id: string; name: string | null; phone: string | null; externalId: string };
  assignedAgent: { id: string; name: string } | null;
  messages: Message[];
  internalNotes: Note[];
}

export default function ConversationThreadPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [reply, setReply] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    api.get<ConversationDetail>(`/conversations/${id}`).then(setConversation);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function sendReply(e: FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/conversations/${id}/messages`, { content: reply });
      setReply("");
      load();
    } finally {
      setSending(false);
    }
  }

  async function addNote(e: FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    await api.post(`/conversations/${id}/notes`, { content: note });
    setNote("");
    load();
  }

  async function toggleAi() {
    if (!conversation) return;
    await api.patch(`/conversations/${id}/ai-enabled`, { aiEnabled: !conversation.aiEnabled });
    load();
  }

  async function assignToMe() {
    if (!user) return;
    await api.patch(`/conversations/${id}/assign`, { agentId: user.id });
    load();
  }

  async function handoff() {
    await api.post(`/conversations/${id}/handoff`, { note: "Manually handed off from dashboard" });
    load();
  }

  async function closeConversation() {
    await api.patch(`/conversations/${id}/close`, {});
    load();
  }

  if (!conversation) return <div className="p-8 text-sm text-slate-500">Loading…</div>;

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col border-r border-slate-200">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="font-medium text-slate-900">
              {conversation.customer.name || conversation.customer.phone || conversation.customer.externalId}
            </p>
            <p className="text-xs text-slate-500">{conversation.channel}</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button onClick={toggleAi} className="rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-50">
              AI: {conversation.aiEnabled ? "On" : "Off"}
            </button>
            <button onClick={assignToMe} className="rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-50">
              Assign to me
            </button>
            <button onClick={handoff} className="rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-50">
              Hand off
            </button>
            <button onClick={closeConversation} className="rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-50">
              Close
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
          {conversation.messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
        </div>

        <form onSubmit={sendReply} className="flex gap-2 border-t border-slate-200 px-6 py-4">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Reply as agent…"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </div>

      <aside className="w-72 shrink-0 overflow-y-auto px-4 py-4">
        <h2 className="text-sm font-semibold text-slate-900">Internal notes</h2>
        <div className="mt-3 space-y-2">
          {conversation.internalNotes.map((n) => (
            <div key={n.id} className="rounded-md bg-amber-50 p-2 text-xs text-amber-900">
              <p>{n.content}</p>
              <p className="mt-1 text-amber-600">
                {n.author.name} · {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <form onSubmit={addNote} className="mt-3 space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note only your team can see…"
            className="w-full rounded-md border border-slate-300 px-2 py-2 text-xs focus:border-brand-500 focus:outline-none"
            rows={3}
          />
          <button type="submit" className="w-full rounded-md border border-slate-300 py-1.5 text-xs font-medium hover:bg-slate-50">
            Add note
          </button>
        </form>
      </aside>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const fromCustomer = message.sender === MessageSender.CUSTOMER;
  const styles: Record<string, string> = {
    CUSTOMER: "bg-white border border-slate-200 text-slate-900",
    AI: "bg-brand-600 text-white",
    AGENT: "bg-slate-800 text-white",
    SYSTEM: "bg-slate-100 text-slate-500 italic",
  };

  return (
    <div className={`flex ${fromCustomer ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-md rounded-lg px-3 py-2 text-sm ${styles[message.sender]}`}>
        <p>{message.content}</p>
        <p className="mt-1 text-[10px] opacity-70">
          {message.sender} · {new Date(message.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
