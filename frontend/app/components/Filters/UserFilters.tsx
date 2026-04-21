"use client";

import { Filter, Search } from "lucide-react";

interface UserFiltersProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function UserFilters({ search, setSearch }: UserFiltersProps) {
  return (
    <div className="grid gap-3 rounded-2xl border border-acero bg-white p-4 md:grid-cols-4">
      <label className="md:col-span-2 flex items-center gap-2 rounded-xl border border-acero px-3">
        <Search size={16} className="text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre/email"
          className="w-full py-2 text-sm outline-none"
        />
      </label>
      <select className="rounded-xl border border-acero px-3 py-2 text-sm">
        <option>Todos los roles</option>
        <option>Administrador</option>
        <option>Cliente</option>
      </select>
      <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-acero px-3 py-2 text-sm">
        <Filter size={14} /> Filtrar
      </button>
    </div>
  );
}
