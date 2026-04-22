"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import ReservationCard from "@/app/components/Cards/ReservationCard";
import Button from "@/app/components/UI/Button";
import Spinner from "@/app/components/UI/Spinner";
import Toast from "@/app/components/UI/Toast";
import { useAuth } from "@/context/AuthContext";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { getReservationsByUser } from "@/lib/services/reservations";
import { Reservation } from "@/lib/types";

export default function MyReservationsPage() {
  const { userId, isReady } = useAuth();
  const [filter, setFilter] = useState<"todas" | "activas" | "pasadas">("todas");
  const numericUserId = userId ? Number(userId) : null;

  const reservationsQuery = useApiQuery<Reservation[]>(
    () => getReservationsByUser(numericUserId || 0),
    [numericUserId],
    { enabled: isReady && Boolean(numericUserId) }
  );

  const filtered = useMemo(() => {
    const rows = reservationsQuery.data || [];
    if (filter === "activas") return rows.filter((item) => item.estado === "confirmada");
    if (filter === "pasadas") return rows.filter((item) => item.estado !== "confirmada");
    return rows;
  }, [filter, reservationsQuery.data]);

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

      {reservationsQuery.loading && <Spinner />}
      {reservationsQuery.error && <Toast kind="error" message={reservationsQuery.error} />}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((reservation) => (
          <ReservationCard key={reservation.id} reservation={reservation} />
        ))}
      </div>
    </div>
  );
}
