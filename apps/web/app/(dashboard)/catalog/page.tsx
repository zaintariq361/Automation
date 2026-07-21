"use client";

import { useEffect, useState } from "react";
import { ProductDTO } from "@conviyo/shared";
import { api, ApiError } from "../../../lib/api";

export default function CatalogPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    api.get<ProductDTO[]>("/catalog/products").then(setProducts);
  }

  useEffect(load, []);

  async function sync() {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await api.post<{ synced: number }>("/catalog/shopify/sync");
      setMessage(`Synced ${res.synced} products from Shopify.`);
      load();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Catalog</h1>
          <p className="mt-1 text-sm text-slate-500">Products the AI sales agent can search and sell.</p>
        </div>
        <button
          onClick={sync}
          disabled={syncing}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {syncing ? "Syncing…" : "Sync from Shopify"}
        </button>
      </div>

      {message && <p className="mt-4 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">{message}</p>}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div key={p.id} className="rounded-lg border border-slate-200 bg-white p-4">
            {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="mb-3 h-32 w-full rounded-md object-cover" />}
            <p className="font-medium text-slate-900">{p.title}</p>
            <p className="mt-1 text-sm text-slate-600">
              {p.currency} {Number(p.price).toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-slate-400">{p.inventory} in stock</p>
          </div>
        ))}
        {products.length === 0 && (
          <p className="col-span-full text-sm text-slate-500">
            No products yet. Connect Shopify in Settings, then sync.
          </p>
        )}
      </div>
    </div>
  );
}
