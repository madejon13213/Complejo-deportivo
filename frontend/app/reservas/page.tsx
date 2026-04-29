"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import WeeklyCalendar from "@/app/components/Domain/WeeklyCalendar";
import Button from "@/app/components/UI/Button";
import Input from "@/app/components/UI/Input";
import Select from "@/app/components/UI/Select";
import Spinner from "@/app/components/UI/Spinner";
import Toast from "@/app/components/UI/Toast";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { CalendarRange, toLocalSlot } from "@/lib/date";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { getCourts } from "@/lib/services/courts";
import { createReservation, getReservationsBySpace } from "@/lib/services/reservations";
import { Court, Reservation } from "@/lib/types";

function overlaps(range: CalendarRange, reservation: Reservation) {
  if (reservation.fecha !== range.date || reservation.estado.toLowerCase() === "cancelada") return false;
  const start = Number(reservation.hora_inicio.slice(0, 2));
  const end = Number(reservation.hora_fin.slice(0, 2));
  return range.startHour < end && range.endHour > start;
}

function getReservationUnits(reservation: Reservation, capacity: number, allowsPartial: boolean): number {
  if (allowsPartial && reservation.tipo_reserva.toLowerCase() === "parcial") {
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
  const normalizedRole = (role || "CLIENTE").toUpperCase();

  const [selectedCourt, setSelectedCourt] = useState<string>("");
  const [selection, setSelection] = useState<CalendarRange | null>(null);
  const [numPersonas, setNumPersonas] = useState("1");
  const [espaciosReservados, setEspaciosReservados] = useState("1");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error" | "warning" | "info"; message: string } | null>(null);
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
    if (!selectedCourt) return;

    const interval = setInterval(() => {
      void reservationsQuery.refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedCourt, reservationsQuery]);

  useEffect(() => {
    setSelection(null);
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

  const occupiedUnitsForSelection =
    selection ? getOccupiedUnits(selection, reservations, courtCapacity, allowsPartial) : 0;

  const availableUnitsForSelection = Math.max(0, courtCapacity - occupiedUnitsForSelection);
  const requestedSpaces = Math.max(1, Number(espaciosReservados) || 1);

  const selectedRangeConflict = selection
    ? allowsPartial
      ? requestedSpaces > availableUnitsForSelection
      : occupiedUnitsForSelection >= courtCapacity
    : false;

  const canConfirm = Boolean(selection && selectedCourt && numericUserId);

  const previewPrice = useMemo(() => {
    if (!selection || !selectedCourtDetails) return 0;
    const hours = Math.max(0, selection.endHour - selection.startHour);
    if (!hours) return 0;

    if (allowsPartial) {
      const unit = selectedCourtDetails.precio_hora_parcial || ((selectedCourtDetails.precio_hora || 0) / Math.max(1, courtCapacity));
      return Number((hours * unit * requestedSpaces).toFixed(2));
    }

    return Number((hours * (selectedCourtDetails.precio_hora || 0)).toFixed(2));
  }, [selection, selectedCourtDetails, allowsPartial, courtCapacity, requestedSpaces]);

  const onConfirm = async () => {
    if (!selection || !selectedCourt || !numericUserId) {
      setFeedback({ kind: "warning", message: "Primero selecciona pista y horario." });
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

    if (selectedRangeConflict && normalizedRole !== "CLUB" && normalizedRole !== "ADMIN") {
      setFeedback({ kind: "error", message: "No hay disponibilidad suficiente para esta seleccion." });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const startSlot = toLocalSlot(selection.date, selection.startHour);
    const endSlot = toLocalSlot(selection.date, selection.endHour);

    const tipoReserva = allowsPartial && requestedSpaces < courtCapacity ? "parcial" : "completa";

    try {
      await createReservation({
        fecha: startSlot.fecha,
        hora_inicio: startSlot.hora,
        hora_fin: endSlot.hora,
        tipo_reserva: tipoReserva,
        plazas_parciales: tipoReserva === "parcial" ? requestedSpaces : null,
        numero_personas: tipoReserva === "parcial" ? Number(numPersonas) : null,
        id_user: numericUserId,
        id_espacio: Number(selectedCourt),
      });

      setSelection(null);
      setFeedback({ kind: "success", message: "Reserva creada correctamente." });
      await reservationsQuery.refetch();
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError?.status === 409) {
        setFeedback({ kind: "error", message: "La franja ya no esta disponible. Se actualizo la disponibilidad." });
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
    <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-8">
      <h1 className="text-4xl font-medium tracking-tight">Reservas</h1>
      {feedback && <Toast kind={feedback.kind} message={feedback.message} />}

      <section className="rounded-[24px] border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Paso 1</p>
            <Select
              label="Seleccion de pista"
              value={selectedCourt}
              onChange={(event) => setSelectedCourt(event.target.value)}
              options={[{ value: "", label: "Selecciona una pista" }, ...courtOptions]}
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Paso 2</p>
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-200">
              {!selectedCourt && "Elige primero una pista para ver su horario disponible."}
              {selectedCourt && reservationsQuery.loading && "Cargando disponibilidad en tiempo real..."}
              {selectedCourt && !reservationsQuery.loading && "Disponibilidad cargada. Selecciona una o varias horas libres."}
            </div>
          </div>
        </div>

        {allowsPartial && selectedCourt && (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
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
            <div className="flex items-end rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-300">
              Disponibles en franja: {availableUnitsForSelection}/{courtCapacity}
            </div>
          </div>
        )}
      </section>

      {!selectedCourt && <Toast kind="info" message="Paso 1: selecciona una pista para desbloquear el horario." />}
      {selectedCourt && reservationsQuery.error && <Toast kind="error" message={reservationsQuery.error} />}

      {selectedCourt && (
        <section className="space-y-3 rounded-[24px] border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Paso 3: seleccion de horas</p>
            <Button variant="secondary" onClick={() => reservationsQuery.refetch()}>
              Refrescar disponibilidad
            </Button>
          </div>

          {reservationsQuery.loading ? (
            <Spinner />
          ) : (
            <WeeklyCalendar
              reservations={reservations}
              role={normalizedRole}
              userId={numericUserId}
              courtCapacity={courtCapacity}
              allowsPartial={allowsPartial}
              onSelectionChange={(nextRange) => setSelection(nextRange)}
            />
          )}
        </section>
      )}

      <section className="rounded-[24px] border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Paso 4</p>
        <h2 className="mt-1 text-xl font-medium">Confirmacion de reserva</h2>

        {!selection && <p className="mt-2 text-sm text-gray-300">Aun no has seleccionado un horario.</p>}

        {selection && (
          <>
            <p className="mt-2 text-sm text-gray-200">
              Pista #{selectedCourt} · Dia {selection.date} · {String(selection.startHour).padStart(2, "0")}:00 - {String(selection.endHour).padStart(2, "0")}:00
            </p>
            <p className="mt-2 text-base font-semibold text-[#ffcc9f]">Precio total estimado: {previewPrice.toFixed(2)} €</p>
          </>
        )}

        {selectedRangeConflict && normalizedRole !== "CLUB" && normalizedRole !== "ADMIN" && (
          <div className="mt-3">
            <Toast kind="error" message="No hay disponibilidad suficiente en la pista seleccionada." />
          </div>
        )}

        <div className="mt-4">
          <Button
            disabled={
              !canConfirm ||
              saving ||
              (selectedRangeConflict && normalizedRole !== "CLUB" && normalizedRole !== "ADMIN")
            }
            onClick={onConfirm}
          >
            {saving ? "Confirmando..." : "Confirmar reserva"}
          </Button>
        </div>
      </section>
    </div>
  );
}
