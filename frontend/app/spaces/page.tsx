"use client";

import { useState } from "react";
import SpaceCard from "@/app/components/Cards/SpaceCard";
import Spinner from "@/app/components/UI/Spinner";
import Toast from "@/app/components/UI/Toast";
import Pagination from "@/app/components/UI/Pagination";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { getSpaces } from "@/lib/services/spaces";
import { SpaceTypeSearchResponse } from "@/lib/types";

const LIMIT = 6;

export default function SpacesPage() {
  const [page, setPage] = useState(1);
  const spacesQuery = useApiQuery<SpaceTypeSearchResponse>(() => getSpaces(page, LIMIT), [page]);

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-8">
      <h1 className="text-3xl">Tipos de espacios</h1>
      {spacesQuery.loading && <Spinner />}
      {spacesQuery.error && <Toast kind="error" message={spacesQuery.error} />}
      
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(spacesQuery.data?.items || []).map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
        
        <Pagination 
          currentPage={page} 
          totalPages={spacesQuery.data?.total_pages || 0} 
          onPageChange={setPage} 
        />
      </div>
    </div>
  );
}
