"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/app/components/UI/Button";
import Select from "@/app/components/UI/Select";
import Spinner from "@/app/components/UI/Spinner";
import Toast from "@/app/components/UI/Toast";
import WeeklyCalendar from "@/app/components/Domain/WeeklyCalendar";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { CalendarRange, toUtcSlot } from "@/lib/date";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { getCourts } from "@/lib/services/courts";
import { createReservation, getActiveReservations } from "@/lib/services/reservations";
import { Court, Reservation } from "@/lib/types";

function overlapWithExisting(range: CalendarRange, reservations: Reservation[]) {
  return reservations.some((reservation) => {
    if (reservation.fecha !== range.date || reservation.estado === "cancelada") return false;
    const start = Number(reservation.hora_inicio.slice(0, 2));
    const end = Number(reservation.hora_fin.slice(0, 2));
    return range.startHour < end && range.endHour > start;
  });
}

export default function ReservasPage() {
  const searchParams = useSearchParams();
  const { role, userId } = useAuth();
  const numericUserId = userId ? Number(userId) : null;

  const [selectedCourt, setSelectedCourt] = useState<string>("");
  const [selection, setSelection] = useState<CalendarRange | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error" | "warning"; message: string } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  const courtsQuery = useApiQuery<Court[]>(() => getCourts(), []);
  const reservationsQuery = useApiQuery<Reservation[]>(() => getActiveReservations(), []);

  const reservations = reservationsQuery.data || [];
  const courtOptions = useMemo(
    () =>
      (courtsQuery.data || []).map((court) => ({
        value: String(court.id),
        label: `${court.nombre} · ${court.precio_hora ?? 0} €/h`,
      })),
    [courtsQuery.data]
  );

  useEffect(() => {
    const preselectedCourt = searchParams.get("courtId");
    if (preselectedCourt) {
      setSelectedCourt(preselectedCourt);
    }
  }, [searchParams]);

  const selectedRangeConflict = selection ? overlapWithExisting(selection, reservations) : false;

  const onOpenConfirm = () => {
    if (!selection || !selectedCourt || !numericUserId) {
      setFeedback({ kind: "warning", message: "Selecciona pista y franja horaria antes de confirmar." });
      return;
    }

    setFeedback(null);
    setConfirming(true);
  };

  const onConfirm = async () => {
    if (!selection || !selectedCourt || !numericUserId) return;

    setSaving(true);
    setFeedback(null);

    const startUtc = toUtcSlot(selection.date, selection.startHour);
    const endUtc = toUtcSlot(selection.date, selection.endHour);

    try {
      await createReservation({
        fecha: startUtc.fecha,
        hora_inicio: startUtc.hora,
        hora_fin: endUtc.hora,
        tipo_reserva: "completa",
        id_user: numericUserId,
        id_espacio: Number(selectedCourt),
      });

      setConfirming(false);
      setSelection(null);
      setFeedback({ kind: "success", message: "Reserva creada correctamente." });
      await reservationsQuery.refetch();
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError?.status === 409) {
        setFeedback({ kind: "error", message: "La franja ya no esta disponible. Recargando calendario..." });
        setConfirming(false);
        await reservationsQuery.refetch();
        return;
      }

      setFeedback({ kind: "error", message: error instanceof Error ? error.message : "No se pudo crear la reserva." });
    } finally {
      setSaving(false);
    }
  };

  if (courtsQuery.loading || reservationsQuery.loading) {
    return (
      <div className="mx-auto flex max-w-5xl items-center justify-center p-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-8">
      <h1 className="text-3xl">Calendario de reservas</h1>
      {feedback && <Toast kind={feedback.kind} message={feedback.message} />}

      <section className="grid gap-3 rounded-2xl border border-acero bg-white p-4 md:grid-cols-3">
        <Select
          label="Pista"
          value={selectedCourt}
          onChange={(event) => setSelectedCourt(event.target.value)}
          options={[{ value: "", label: "Selecciona una pista" }, ...courtOptions]}
        />
        <div className="md:col-span-2 flex items-end">
          <Button onClick={onOpenConfirm}>Confirmar seleccion</Button>
        </div>
      </section>

      <WeeklyCalendar
        reservations={reservations}
        role={role}
        userId={numericUserId}
        onSelectionChange={(nextRange) => setSelection(nextRange)}
      />

      {confirming && selection && (
        <div className="rounded-2xl border border-acero bg-white p-4">
          <h2 className="text-xl">Confirmar reserva</h2>
          <p className="mt-2 text-sm text-gray-700">
            Dia {selection.date} · {String(selection.startHour).padStart(2, "0")}:00 - {String(selection.endHour).padStart(2, "0")}:00
          </p>
          {selectedRangeConflict && role === "club" && (
            <Toast
              kind="warning"
              message="Estas sobreescribiendo una franja ocupada. El backend validara si procede el override."
            />
          )}
          {selectedRangeConflict && role !== "club" && (
            <Toast kind="error" message="No puedes confirmar porque la franja esta ocupada." />
          )}
          <div className="mt-3 flex gap-2">
            <Button disabled={saving || (selectedRangeConflict && role !== "club")} onClick={onConfirm}>
              {saving ? "Guardando..." : "Confirmar"}
            </Button>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
