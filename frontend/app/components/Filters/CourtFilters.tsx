"use client";

import { Filter, Search, X } from "lucide-react";
import { SpaceType } from "@/lib/types";

interface CourtFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  typeId?: number;
  setTypeId: (id?: number) => void;
  spaceTypes: SpaceType[];
}

export default function CourtFilters({ 
  search, 
  setSearch, 
  typeId, 
  setTypeId, 
  spaceTypes 
}: CourtFiltersProps) {
  const clearSearch = () => setSearch("");

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-black/35 p-4 backdrop-blur-sm md:flex-row md:items-center">
      <div className="relative flex flex-1 items-center gap-2 rounded-xl border border-white/15 bg-black/30 px-3 focus-within:border-blue-500/50 transition-colors">
        <Search size={16} className="text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar pistas por nombre..."
          className="w-full bg-transparent py-2 text-sm text-white outline-none placeholder:text-gray-400"
        />
        {search && (
          <button 
            onClick={clearSearch}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <select 
          value={typeId || ""}
          onChange={(e) => setTypeId(e.target.value ? Number(e.target.value) : undefined)}
          className="min-w-[160px] rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-gray-100 outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
        >
          <option value="">Todos los tipos</option>
          {spaceTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.tipo}
            </option>
          ))}
        </select>

      </div>
    </div>
  );
}