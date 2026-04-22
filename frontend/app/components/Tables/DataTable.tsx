"use client";

import { ReactNode, useMemo, useState } from "react";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  searchable?: (row: T) => string;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  pageSize?: number;
}

export default function DataTable<T>({ rows, columns, emptyMessage = "Sin datos", pageSize = 10 }: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const normalized = search.toLowerCase().trim();
    if (!normalized) return rows;

    return rows.filter((row) =>
      columns.some((column) => {
        if (!column.searchable) return false;
        return column.searchable(row).toLowerCase().includes(normalized);
      })
    );
  }, [columns, rows, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <section className="space-y-3 rounded-2xl border border-acero bg-white p-4">
      <input
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
        placeholder="Buscar..."
        className="w-full rounded-xl border border-acero px-3 py-2 text-sm"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-nieve text-left">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-3 py-2">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, idx) => (
              <tr key={idx} className="border-t border-acero">
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-2">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginatedRows.length === 0 && <p className="text-sm text-gray-600">{emptyMessage}</p>}

      <div className="flex items-center justify-end gap-2 text-sm">
        <button
          className="rounded-lg border border-acero px-3 py-1 disabled:opacity-50"
          disabled={safePage <= 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Anterior
        </button>
        <span>
          {safePage} / {totalPages}
        </span>
        <button
          className="rounded-lg border border-acero px-3 py-1 disabled:opacity-50"
          disabled={safePage >= totalPages}
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}
