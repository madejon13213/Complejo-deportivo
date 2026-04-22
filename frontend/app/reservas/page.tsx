"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/app/components/UI/Button";
import Input from "@/app/components/UI/Input";
import Select from "@/app/components/UI/Select";
import Spinner from "@/app/components/UI/Spinner";
import Toast from "@/app/components/UI/Toast";
import WeeklyCalendar from "@/app/components/Domain/WeeklyCalendar";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { CalendarRange, toUtcSlot } from "@/lib/date";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { getCourts } from "@/lib/services/courts";
import { createReservation, getReservationsBySpace } from "@/lib/services/reservations";
import { Court, Reservation } from "@/lib/types";

function overlaps(range: CalendarRange, reservation: Reservation) {
  if (reservation.fecha !== range.date || reservation.estado === "cancelada") return false;
  const start = Number(reservation.hora_inicio.slice(0, 2));
  const end = Number(reservation.hora_fin.slice(0, 2));
  return range.startHour < end && range.endHour > start;
}

function getReservationUnits(reservation: Reservation, capacity: number, allowsPartial: boolean): number {
  if (allowsPartial && reservation.tipo_reserva === "parcial") {
    return Math.max(1, reservation.plazas_parciales || 1);
  }
  return capacity;
}

function getOccupiedUnits(range: CalendarRange, reservations: Reservation[], capacity: number, allowsPartial: boolean): number {
  const occupied = reservations
    .filter((reservation) => overlaps(range, reservation))
    .reduce((sum, reservation) => sum + getReservationUnits(reservation, capacity, allowsPartial), 0);

  return Math.min(capacity, occupied);
}

export default function ReservasPage() {
  const searchParams = useSearchParams();
  const { role, userId } = useAuth();
  const numericUserId = userId ? Number(userId) : null;

  const [selectedCourt, setSelectedCourt] = useState<string>("");
  const [selection, setSelection] = useState<CalendarRange | null>(null);
  const [numPersonas, setNumPersonas] = useState("1");
  const [espaciosReservados, setEspaciosReservados] = useState("1");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error" | "warning"; message: string } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  const courtsQuery = useApiQuery<Court[]>(() => getCourts(), []);

  useEffect(() => {
    const preselectedCourt = searchParams.get("courtId");
    if (preselectedCourt) {
      setSelectedCourt(preselectedCourt);
    }
  }, [searchParams]);

  const selectedCourtDetails = useMemo(() => {
    return (courtsQuery.data || []).find((court) => String(court.id) === selectedCourt) || null;
  }, [courtsQuery.data, selectedCourt]);

  const courtCapacity = Math.max(1, selectedCourtDetails?.capacidad || 1);
  const allowsPartial = Boolean(selectedCourtDetails?.permite_reserva_parcial);

  const reservationsQuery = useApiQuery<Reservation[]>(
    () => getReservationsBySpace(Number(selectedCourt)),
    [selectedCourt],
    { enabled: Boolean(selectedCourt) }
  );

  useEffect(() => {
    setSelection(null);
    setConfirming(false);
    setNumPersonas("1");
    setEspaciosReservados("1");
  }, [selectedCourt]);

  const reservations = reservationsQuery.data || [];
  const courtOptions = useMemo(
    () =>
      (courtsQuery.data || []).map((court) => ({
        value: String(court.id),
        label: `${court.nombre} · ${court.precio_hora ?? 0} €/h`,
      })),
    [courtsQuery.data]
  );

  const occupiedUnitsForSelection = selection
    ? getOccupiedUnits(selection, reservations, courtCapacity, allowsPartial)
    : 0;

  const availableUnitsForSelection = Math.max(0, courtCapacity - occupiedUnitsForSelection);
  const requestedSpaces = Math.max(1, Number(espaciosReservados) || 1);

  const selectedRangeConflict = selection
    ? allowsPartial
      ? requestedSpaces > availableUnitsForSelection
      : occupiedUnitsForSelection >= courtCapacity
    : false;

  const onOpenConfirm = () => {
    if (!selection || !selectedCourt || !numericUserId) {
      setFeedback({ kind: "warning", message: "Selecciona pista y franja horaria antes de confirmar." });
      return;
    }

    if (allowsPartial) {
      const people = Number(numPersonas);
      const spaces = Number(espaciosReservados);

      if (!Number.isFinite(people) || people <= 0) {
        setFeedback({ kind: "warning", message: "Indica un numero de personas valido." });
        return;
      }

      if (!Number.isFinite(spaces) || spaces <= 0) {
        setFeedback({ kind: "warning", message: "Indica una cantidad valida de subespacios." });
        return;
      }

      if (spaces > courtCapacity) {
        setFeedback({ kind: "warning", message: `No puedes reservar mas de ${courtCapacity} subespacios.` });
        return;
      }
    }

    setFeedback(null);
    setConfirming(true);
  };

  const onConfirm = async () => {
    if (!selection || !selectedCourt || !numericUserId) return;

    if (selectedRangeConflict && role !== "club") {
      setFeedback({ kind: "error", message: "No hay disponibilidad suficiente para esta seleccion." });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const startUtc = toUtcSlot(selection.date, selection.startHour);
    const endUtc = toUtcSlot(selection.date, selection.endHour);

    const tipoReserva = allowsPartial && requestedSpaces < courtCapacity ? "parcial" : "completa";

    try {
      await createReservation({
        fecha: startUtc.fecha,
        hora_inicio: startUtc.hora,
        hora_fin: endUtc.hora,
        tipo_reserva: tipoReserva,
        plazas_parciales: tipoReserva === "parcial" ? requestedSpaces : null,
        id_user: numericUserId,
        id_espacio: Number(selectedCourt),
      });

      setConfirming(false);
      setSelection(null);
      setFeedback({ kind: "success", message: "Reserva creada correctamente en la pista seleccionada." });
      await reservationsQuery.refetch();
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError?.status === 409) {
        setFeedback({ kind: "error", message: "La franja ya no esta disponible. Recargando disponibilidad..." });
        setConfirming(false);
        await reservationsQuery.refetch();
        return;
      }

      setFeedback({ kind: "error", message: error instanceof Error ? error.message : "No se pudo crear la reserva." });
    } finally {
      setSaving(false);
    }
  };

  if (courtsQuery.loading) {
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

        {allowsPartial && (
          <>
            <Input
              label="Numero de personas"
              type="number"
              min="1"
              value={numPersonas}
              onChange={(event) => setNumPersonas(event.target.value)}
            />
            <Input
              label="Subespacios reservados"
              type="number"
              min="1"
              max={String(courtCapacity)}
              value={espaciosReservados}
              onChange={(event) => setEspaciosReservados(event.target.value)}
            />
            <div className="flex items-end text-sm text-gray-600">
              Disponibles en franja: {availableUnitsForSelection}/{courtCapacity}
            </div>
          </>
        )}
      </section>

      {!selectedCourt && <Toast kind="info" message="Selecciona una pista para ver su disponibilidad real." />}
      {selectedCourt && reservationsQuery.loading && <Spinner />}
      {selectedCourt && reservationsQuery.error && <Toast kind="error" message={reservationsQuery.error} />}

      <WeeklyCalendar
        reservations={reservations}
        role={role}
        userId={numericUserId}
        courtCapacity={courtCapacity}
        allowsPartial={allowsPartial}
        onSelectionChange={(nextRange) => setSelection(nextRange)}
      />

      {confirming && selection && (
        <div className="rounded-2xl border border-acero bg-white p-4">
          <h2 className="text-xl">Confirmar reserva</h2>
          <p className="mt-2 text-sm text-gray-700">
            Pista #{selectedCourt} · Dia {selection.date} · {String(selection.startHour).padStart(2, "0")}:00 - {String(selection.endHour).padStart(2, "0")}:00
          </p>

          {allowsPartial && (
            <p className="mt-1 text-sm text-gray-700">
              Personas: {numPersonas} · Subespacios: {requestedSpaces}/{courtCapacity}
            </p>
          )}

          {selectedRangeConflict && role === "club" && (
            <Toast
              kind="warning"
              message="La franja esta completa. Como club, puedes intentar override y el backend decidira si procede."
            />
          )}

          {selectedRangeConflict && role !== "club" && (
            <Toast kind="error" message="No hay disponibilidad suficiente en la pista seleccionada." />
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
