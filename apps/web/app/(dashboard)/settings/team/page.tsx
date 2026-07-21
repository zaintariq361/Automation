"use client";

import { useEffect, useState, FormEvent } from "react";
import { UserDTO } from "@conviyo/shared";
import { api, ApiError } from "../../../../lib/api";
import { useToast } from "../../../../lib/toast-context";

export default function TeamPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [credentialBanner, setCredentialBanner] = useState<string | null>(null);

  function load() {
    api.get<UserDTO[]>("/users").then(setUsers);
  }

  useEffect(load, []);

  async function invite(e: FormEvent) {
    e.preventDefault();
    setInviting(true);
    setCredentialBanner(null);
    try {
      const res = await api.post<{ user: UserDTO; temporaryPassword: string }>("/users/invite", { name, email });
      setCredentialBanner(`Invited ${res.user.email}. Temporary password: ${res.temporaryPassword}`);
      setName("");
      setEmail("");
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Invite failed", "error");
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Team</h1>
      <p className="mt-1 text-sm text-slate-500">Agents who can work the shared inbox.</p>

      <form onSubmit={invite} className="mt-6 flex gap-3 rounded-lg border border-slate-200 bg-white p-5">
        <input
          required
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={inviting}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          Invite
        </button>
      </form>

      {credentialBanner && (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{credentialBanner}</p>
      )}

      <div className="mt-6 space-y-2">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <p className="font-medium text-slate-900">{u.name}</p>
              <p className="text-xs text-slate-500">{u.email}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{u.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
