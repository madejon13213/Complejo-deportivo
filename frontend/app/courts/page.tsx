"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import CourtCard from "@/app/components/Cards/CourtCard";
import CourtFilters from "@/app/components/Filters/CourtFilters";
import Spinner from "@/app/components/UI/Spinner";
import Toast from "@/app/components/UI/Toast";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { getCourts, getCourtsByType } from "@/lib/services/courts";
import { Court } from "@/lib/types";

export default function CourtsPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");

  const spaceTypeParam = searchParams.get("spaceType");
  const spaceType = spaceTypeParam ? Number(spaceTypeParam) : null;

  const courtsQuery = useApiQuery<Court[]>(
    () => (spaceType ? getCourtsByType(spaceType) : getCourts()),
    [spaceType]
  );

  const filtered = useMemo(() => {
    const rows = courtsQuery.data || [];
    return rows.filter((court) => court.nombre.toLowerCase().includes(search.toLowerCase()));
  }, [courtsQuery.data, search]);

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-8">
      <h1 className="text-3xl">Pistas</h1>
      <CourtFilters search={search} setSearch={setSearch} />
      {courtsQuery.loading && <Spinner />}
      {courtsQuery.error && <Toast kind="error" message={courtsQuery.error} />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((court) => (
          <CourtCard key={court.id} court={court} />
        ))}
      </div>
    </div>
  );
}
