import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createImageItem, createManualItem, createUrlItem, listItems } from "../api/client";
import { ItemCard } from "../components/ItemCard";
import type { Item } from "../types";

const INITIAL_FORM = {
  manual: "",
  url: "",
  image: "",
};

export function Home() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadItems() {
    setLoading(true);
    setError(null);
    try {
      const data = await listItems();
      setItems(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  function toggleSelection(itemId: string) {
    setSelectedIds((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId],
    );
  }

  async function handleCreate(kind: "manual" | "url" | "image") {
    const value = form[kind].trim();
    if (!value) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (kind === "manual") {
        await createManualItem(value);
      } else if (kind === "url") {
        await createUrlItem(value);
      } else {
        await createImageItem(value);
      }
      setForm((current) => ({ ...current, [kind]: "" }));
      await loadItems();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create item");
      setLoading(false);
    }
  }

  const canCompare = selectedIds.length >= 2;
  const selectedCountLabel = useMemo(() => `${selectedIds.length} selected`, [selectedIds.length]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Compare Anything</p>
        <h1 className="text-4xl font-semibold text-slate-950">Create a comparison set from text, links, or screenshots.</h1>
        <p className="max-w-3xl text-base text-slate-600">
          This MVP stores items, normalizes a few fields, and generates a stub comparison report that can later be replaced with real extraction and AI analysis.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">Manual input</h2>
          <textarea
            value={form.manual}
            onChange={(event) => setForm((current) => ({ ...current, manual: event.target.value }))}
            className="mt-3 min-h-40 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-0"
            placeholder="Paste product notes, service details, or any object description"
          />
          <button type="button" onClick={() => void handleCreate("manual")} className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Add manual item
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">URL import</h2>
          <input
            value={form.url}
            onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))}
            className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
            placeholder="https://example.com/item"
          />
          <button type="button" onClick={() => void handleCreate("url")} className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Add URL item
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">Image import</h2>
          <input
            value={form.image}
            onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
            className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
            placeholder="https://example.com/screenshot.png"
          />
          <button type="button" onClick={() => void handleCreate("image")} className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Add image item
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Items</h2>
            <p className="text-sm text-slate-500">{selectedCountLabel}</p>
          </div>
          <button
            type="button"
            disabled={!canCompare}
            onClick={() => navigate("/result", { state: { itemIds: selectedIds } })}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Compare selected items
          </button>
        </div>

        {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} selected={selectedIds.includes(item.id)} onToggle={toggleSelection} />
          ))}
        </div>
      </section>
    </div>
  );
}
