"use client";

import { useMemo, useState } from "react";
import ReservationsTable from "@/app/components/Tables/ReservationsTable";
import ReservationFilters from "@/app/components/Filters/ReservationFilters";
import Pagination from "@/app/components/Pagination/Pagination";
import { Reservation } from "@/lib/types";

const rows: Reservation[] = [
  { id: 1, fecha: "2026-04-22", estado: "confirmada", courtName: "Pista 1", userName: "Ana" },
  { id: 2, fecha: "2026-04-23", estado: "cancelada", courtName: "Pista 2", userName: "Luis" },
  { id: 3, fecha: "2026-04-24", estado: "confirmada", courtName: "Pista 3", userName: "Marta" },
];

export default function ReservationsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => rows.filter((row) => `${row.courtName} ${row.userName}`.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-8">
      <h1 className="text-3xl">Gestión de reservas</h1>
      <ReservationFilters search={search} setSearch={setSearch} />
      <ReservationsTable rows={filtered} />
      <Pagination page={page} totalPages={1} onPageChange={setPage} />
    </div>
  );
}
