import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { createComparison } from "../api/client";
import { AiStream } from "../components/AiStream";
import { CompareTable } from "../components/CompareTable";
import type { Comparison } from "../types";

interface ResultState {
  itemIds?: string[];
}

export function Result() {
  const location = useLocation();
  const state = (location.state as ResultState | null) ?? null;
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runComparison() {
      if (!state?.itemIds || state.itemIds.length < 2) {
        setError("Select at least two items before comparing.");
        setLoading(false);
        return;
      }

      try {
        const result = await createComparison({ item_ids: state.itemIds });
        setComparison(result);
      } catch (comparisonError) {
        setError(comparisonError instanceof Error ? comparisonError.message : "Failed to compare items");
      } finally {
        setLoading(false);
      }
    }

    void runComparison();
  }, [state?.itemIds]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Comparison result</p>
          <h1 className="text-4xl font-semibold text-slate-950">Review the generated report and normalized table.</h1>
        </div>
        <Link to="/" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
          Back
        </Link>
      </div>

      {loading ? <p className="text-sm text-slate-500">Generating comparison…</p> : null}
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {comparison ? (
        <div className="space-y-6">
          <AiStream report={comparison.report} dimensions={comparison.dimensions} />
          <CompareTable rows={comparison.table_data} />
        </div>
      ) : null}
    </div>
  );
}
