interface CompareTableProps {
  rows: Record<string, string>[];
}

export function CompareTable({ rows }: CompareTableProps) {
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));

  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">No comparison rows yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 text-left font-medium capitalize text-slate-600">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr key={`${row.title ?? "row"}-${index}`}>
              {columns.map((column) => (
                <td key={column} className="px-4 py-3 align-top text-slate-700">
                  {row[column] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
