interface AiStreamProps {
  report: string;
  dimensions: string[];
}

export function AiStream({ report, dimensions }: AiStreamProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap gap-2">
        {dimensions.map((dimension) => (
          <span key={dimension} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
            {dimension}
          </span>
        ))}
      </div>
      <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-6 text-slate-700">{report}</pre>
    </section>
  );
}
