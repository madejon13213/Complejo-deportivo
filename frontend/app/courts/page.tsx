"use client";

import { useMemo, useState } from "react";
import CourtCard from "@/app/components/Cards/CourtCard";
import CourtFilters from "@/app/components/Filters/CourtFilters";
import { Court } from "@/lib/types";

const courts: Court[] = [
  { id: 1, nombre: "Pista Central", precio: 24, capacidad: 4, rating: 4.8 },
  { id: 2, nombre: "Pista Norte", precio: 18, capacidad: 2, rating: 4.3 },
  { id: 3, nombre: "Cancha Premium", precio: 30, capacidad: 6, rating: 4.9 },
  { id: 4, nombre: "Pista Indoor", precio: 22, capacidad: 4, rating: 4.6 },
];

export default function CourtsPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => courts.filter((court) => court.nombre.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-8">
      <h1 className="text-3xl">Pistas</h1>
      <CourtFilters search={search} setSearch={setSearch} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((court) => (
          <CourtCard key={court.id} court={court} />
        ))}
      </div>
    </div>
  );
}
