import type { Item } from "../types";

interface ItemCardProps {
  item: Item;
  selected: boolean;
  onToggle: (itemId: string) => void;
}

export function ItemCard({ item, selected, onToggle }: ItemCardProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(item.id)}
      className={`w-full rounded-xl border p-4 text-left transition ${
        selected ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{item.source_type}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
          {item.category ?? "uncategorized"}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-700">{item.summary ?? "No summary yet."}</p>
      {item.specs ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(item.specs).map(([key, value]) => (
            <span key={key} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
              {key}: {value}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
}
