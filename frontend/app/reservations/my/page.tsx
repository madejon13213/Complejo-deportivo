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

type ReservationTab = "activas" | "pasadas" | "canceladas";

function isCanceled(reservation: Reservation) {
  return reservation.estado.toLowerCase() === "cancelada";
}

function isPast(reservation: Reservation) {
  const end = new Date(`${reservation.fecha}T${reservation.hora_fin}`);
  return end.getTime() < Date.now();
}

export default function MyReservationsPage() {
  const { userId, isReady } = useAuth();
  const [tab, setTab] = useState<ReservationTab>("activas");
  const numericUserId = userId ? Number(userId) : null;

  const reservationsQuery = useApiQuery<Reservation[]>(
    () => getReservationsByUser(numericUserId || 0),
    [numericUserId],
    { enabled: isReady && Boolean(numericUserId) }
  );

  const grouped = useMemo(() => {
    const rows = reservationsQuery.data || [];
    const canceladas = rows.filter(isCanceled);
    const pasadas = rows.filter((item) => !isCanceled(item) && isPast(item));
    const activas = rows.filter((item) => !isCanceled(item) && !isPast(item));

    return { activas, pasadas, canceladas };
  }, [reservationsQuery.data]);

  const currentRows = grouped[tab];

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-8">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-3xl">Mis reservas</h1>
        <Button variant="secondary" icon={<Download size={16} />}>Descargar historial</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={tab === "activas" ? "primary" : "secondary"} onClick={() => setTab("activas")}>
          Activas / Próximas ({grouped.activas.length})
        </Button>
        <Button variant={tab === "pasadas" ? "primary" : "secondary"} onClick={() => setTab("pasadas")}>
          Pasadas ({grouped.pasadas.length})
        </Button>
        <Button variant={tab === "canceladas" ? "primary" : "secondary"} onClick={() => setTab("canceladas")}>
          Canceladas ({grouped.canceladas.length})
        </Button>
      </div>

      {reservationsQuery.loading && <Spinner />}
      {reservationsQuery.error && <Toast kind="error" message={reservationsQuery.error} />}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {currentRows.map((reservation) => (
          <ReservationCard key={reservation.id} reservation={reservation} />
        ))}
      </div>

      {!reservationsQuery.loading && currentRows.length === 0 && (
        <p className="text-sm text-gray-300">No hay reservas en esta categoría.</p>
      )}
    </div>
  );
}
