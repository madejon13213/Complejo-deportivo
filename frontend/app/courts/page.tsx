"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CourtCard from "@/app/components/Cards/CourtCard";
import CourtFilters from "@/app/components/Filters/CourtFilters";
import Spinner from "@/app/components/UI/Spinner";
import Toast from "@/app/components/UI/Toast";
import Pagination from "@/app/components/UI/Pagination";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { getCourts } from "@/lib/services/courts";
import { getAllSpaces } from "@/lib/services/spaces";
import { CourtSearchResponse, SpaceType } from "@/lib/types";

const LIMIT = 8;

export default function CourtsPage() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("spaceType");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeId, setTypeId] = useState<number | undefined>(initialType ? Number(initialType) : undefined);
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch all space types for the filter dropdown
  const { data: spaceTypes } = useApiQuery<SpaceType[]>(() => getAllSpaces(), []);

  // Sync with URL param if it changes
  useEffect(() => {
    if (initialType) {
      setTypeId(Number(initialType));
      setPage(1);
    }
  }, [initialType]);

  const courtsQuery = useApiQuery<CourtSearchResponse>(
    () => getCourts(page, LIMIT, { search: debouncedSearch, typeId }),
    [page, debouncedSearch, typeId]
  );

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleTypeChange = (id?: number) => {
    setTypeId(id);
    setPage(1);
  };

  const items = courtsQuery.data?.items || [];

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-8">
      <h1 className="text-3xl font-bold text-white">Pistas disponibles</h1>
      <CourtFilters 
        search={search} 
        setSearch={handleSearch} 
        typeId={typeId}
        setTypeId={handleTypeChange}
        spaceTypes={spaceTypes || []}
      />
      
      {courtsQuery.loading && <Spinner />}
      {courtsQuery.error && <Toast kind="error" message={courtsQuery.error} />}
      
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((court) => (
            <CourtCard key={court.id} court={court} />
          ))}
        </div>

        {!courtsQuery.loading && items.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-gray-300 text-lg font-medium">No se encontraron pistas que coincidan con tu búsqueda.</p>
            <p className="text-gray-500 text-sm mt-1">Prueba a ajustar los filtros o limpiar el buscador.</p>
          </div>
        )}

        {courtsQuery.data && (
          <Pagination 
            currentPage={page} 
            totalPages={courtsQuery.data.total_pages} 
            onPageChange={setPage} 
          />
        )}
      </div>
    </div>
  );
}