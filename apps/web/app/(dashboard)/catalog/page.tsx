"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductDTO } from "@conviyo/shared";
import { api, ApiError } from "../../../lib/api";
import { useToast } from "../../../lib/toast-context";

export default function CatalogPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  function load() {
    api
      .get<ProductDTO[]>("/catalog/products")
      .then(setProducts)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function sync() {
    setSyncing(true);
    try {
      const res = await api.post<{ synced: number }>("/catalog/shopify/sync");
      toast(res.synced > 0 ? `Synced ${res.synced} products from Shopify.` : "Shopify isn't connected yet — add credentials in Settings first.", res.synced > 0 ? "success" : "error");
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Sync failed", "error");
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

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-10 text-center">
          <p className="text-3xl">🛍️</p>
          <p className="mt-2 font-medium text-slate-900">No products yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Connect Shopify and sync, or products from your onboarding template will show up here.
          </p>
          <Link
            href="/settings/integrations"
            className="mt-4 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Connect Shopify
          </Link>
        </div>
      ) : (
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
        </div>
      )}
    </div>
  );
}
