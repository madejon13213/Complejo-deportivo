"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import ReservationCard from "@/app/components/Cards/ReservationCard";
import Button from "@/app/components/UI/Button";
import { Reservation } from "@/lib/types";

const reservations: Reservation[] = [
  { id: 1, fecha: "2026-04-24", hora_inicio: "18:00", hora_fin: "19:00", estado: "confirmada", courtName: "Pista 1" },
  { id: 2, fecha: "2026-04-10", hora_inicio: "17:00", hora_fin: "18:00", estado: "completada", courtName: "Pista 4" },
  { id: 3, fecha: "2026-04-09", hora_inicio: "19:00", hora_fin: "20:00", estado: "cancelada", courtName: "Pista 5" },
];

export default function MyReservationsPage() {
  const [filter, setFilter] = useState<"todas" | "activas" | "pasadas">("todas");

  const filtered = reservations.filter((item) => {
    if (filter === "activas") return item.estado === "confirmada";
    if (filter === "pasadas") return item.estado === "completada" || item.estado === "cancelada";
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-8">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-3xl">Mis reservas</h1>
        <Button variant="secondary" icon={<Download size={16} />}>Descargar historial</Button>
      </div>

      <div className="flex gap-2">
        <Button variant={filter === "todas" ? "primary" : "secondary"} onClick={() => setFilter("todas")}>Todas</Button>
        <Button variant={filter === "activas" ? "primary" : "secondary"} onClick={() => setFilter("activas")}>Activas</Button>
        <Button variant={filter === "pasadas" ? "primary" : "secondary"} onClick={() => setFilter("pasadas")}>Pasadas</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((reservation) => (
          <ReservationCard key={reservation.id} reservation={reservation} />
        ))}
      </div>
    </div>
  );
}
