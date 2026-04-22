"use client";

import { useMemo, useState } from "react";
import DataTable from "@/app/components/Tables/DataTable";
import Button from "@/app/components/UI/Button";
import Toast from "@/app/components/UI/Toast";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { cancelReservation, getAllReservations } from "@/lib/services/reservations";
import { Reservation } from "@/lib/types";

export default function AdminReservasPage() {
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const reservationsQuery = useApiQuery<Reservation[]>(() => getAllReservations(), []);

  const onCancel = async (id: number) => {
    setFeedback(null);
    try {
      await cancelReservation(id);
      setFeedback({ kind: "success", message: "Reserva cancelada/eliminada correctamente." });
      await reservationsQuery.refetch();
    } catch (error) {
      setFeedback({ kind: "error", message: error instanceof Error ? error.message : "No se pudo cancelar la reserva." });
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "id",
        header: "ID",
        render: (row: Reservation) => row.id,
        searchable: (row: Reservation) => String(row.id),
      },
      {
        key: "espacio",
        header: "Espacio",
        render: (row: Reservation) => row.id_espacio,
        searchable: (row: Reservation) => String(row.id_espacio),
      },
      {
        key: "usuario",
        header: "Usuario",
        render: (row: Reservation) => row.id_user,
        searchable: (row: Reservation) => String(row.id_user),
      },
      {
        key: "franja",
        header: "Franja",
        render: (row: Reservation) => `${row.fecha} · ${row.hora_inicio} - ${row.hora_fin}`,
        searchable: (row: Reservation) => `${row.fecha} ${row.hora_inicio} ${row.hora_fin}`,
      },
      {
        key: "estado",
        header: "Estado",
        render: (row: Reservation) => row.estado,
        searchable: (row: Reservation) => row.estado,
      },
      {
        key: "acciones",
        header: "Acciones",
        render: (row: Reservation) => (
          <Button variant="danger" onClick={() => onCancel(row.id)}>
            Cancelar
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-8">
      <h1 className="text-3xl">Admin · Reservas</h1>
      {feedback && <Toast kind={feedback.kind} message={feedback.message} />}
      {reservationsQuery.error && <Toast kind="error" message={reservationsQuery.error} />}
      <DataTable rows={reservationsQuery.data || []} columns={columns} emptyMessage="No hay reservas registradas." />
    </div>
  );
}
