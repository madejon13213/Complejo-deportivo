"use client";

import { Filter, Search } from "lucide-react";

interface ReservationFiltersProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function ReservationFilters({ search, setSearch }: ReservationFiltersProps) {
  return (
    <div className="grid gap-3 rounded-2xl border border-acero bg-white p-4 md:grid-cols-4">
      <label className="md:col-span-2 flex items-center gap-2 rounded-xl border border-acero px-3">
        <Search size={16} className="text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por pista o usuario"
          className="w-full py-2 text-sm outline-none"
        />
      </label>
      <input type="date" className="rounded-xl border border-acero px-3 py-2 text-sm" />
      <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-acero px-3 py-2 text-sm">
        <Filter size={14} /> Filtrar
      </button>
    </div>
  );
}
