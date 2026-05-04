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
import { createReservation, estimateReservationPrice, getReservationsBySpace } from "@/lib/services/reservations";
import { Court, CourtSearchResponse, Reservation } from "@/lib/types";

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
  let maxOccupied = 0;

  for (let hour = range.startHour; hour < range.endHour; hour++) {
    const unitsInSlot = reservations
      .filter((res) => {
        const start = Number(res.hora_inicio.slice(0, 2));
        const end = Number(res.hora_fin.slice(0, 2));
        return res.fecha === range.date && res.estado.toLowerCase() !== "cancelada" && start < (hour + 1) && end > hour;
      })
      .reduce((sum, res) => sum + getReservationUnits(res, capacity, allowsPartial), 0);

    if (unitsInSlot > maxOccupied) {
      maxOccupied = unitsInSlot;
    }
  }

  return Math.min(capacity, maxOccupied);
}

export default function ReservasPage() {
  const searchParams = useSearchParams();
  const { role, userId } = useAuth();
  const numericUserId = userId ? Number(userId) : null;
  const normalizedRole = (role || "CLIENTE").toUpperCase();

  const [selectedCourt, setSelectedCourt] = useState<string>("");
  const [selection, setSelection] = useState<CalendarRange | null>(null);
  const [numPersonas, setNumPersonas] = useState("1");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error" | "warning" | "info"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  const courtsQuery = useApiQuery<CourtSearchResponse>(() => getCourts(1, 100), []);

  useEffect(() => {
    const preselectedCourt = searchParams.get("courtId");
    if (preselectedCourt) {
      setSelectedCourt(preselectedCourt);
    }
  }, [searchParams]);

  const selectedCourtDetails = useMemo(() => {
    const items = courtsQuery.data?.items || [];
    return items.find((court) => String(court.id) === selectedCourt) || null;
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
  }, [selectedCourt]);

  const reservations = reservationsQuery.data || [];
  const courtOptions = useMemo(
    () =>
      (courtsQuery.data?.items || []).map((court) => ({
        value: String(court.id),
        label: `${court.nombre} · ${court.precio_hora ?? 0} €/h`,
      })),
    [courtsQuery.data]
  );

  const occupiedUnitsForSelection =
    selection ? getOccupiedUnits(selection, reservations, courtCapacity, allowsPartial) : 0;

  const availableUnitsForSelection = Math.max(0, courtCapacity - occupiedUnitsForSelection);
  const requestedSpaces = Math.max(1, Number(numPersonas) || 1);

  const selectedRangeConflict = selection
    ? allowsPartial
      ? requestedSpaces > availableUnitsForSelection
      : occupiedUnitsForSelection >= courtCapacity
    : false;

  const canConfirm = Boolean(selection && selectedCourt && numericUserId);

  useEffect(() => {
    if (!selection || !selectedCourt) {
      setEstimatedPrice(null);
      return;
    }

    const fetchEstimate = async () => {
      try {
        const startSlot = toLocalSlot(selection.date, selection.startHour);
        const endSlot = toLocalSlot(selection.date, selection.endHour);
        const res = await estimateReservationPrice({
          hora_inicio: startSlot.hora,
          hora_fin: endSlot.hora,
          id_espacio: Number(selectedCourt),
          numero_personas: Number(numPersonas) || 1,
        });
        if (res && res.precio_estimado !== undefined) {
          setEstimatedPrice(res.precio_estimado);
        }
      } catch (err) {
        console.error("Error al estimar precio", err);
        setEstimatedPrice(null);
      }
    };

    void fetchEstimate();
  }, [selection, selectedCourt, numPersonas]);

  const onConfirm = async () => {
    if (!selection || !selectedCourt || !numericUserId) {
      setFeedback({ kind: "warning", message: "Primero selecciona pista y horario." });
      return;
    }

    if (allowsPartial) {
      const people = Number(numPersonas);
      const spaces = people;

      if (!Number.isFinite(people) || people <= 0) {
        setFeedback({ kind: "warning", message: "Indica un número de personas válido." });
        return;
      }

      if (spaces > courtCapacity) {
        setFeedback({ kind: "warning", message: `No hay plazas suficientes (máx: ${courtCapacity}).` });
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

      <div className="grid gap-6 md:grid-cols-12">
        {/* COLUMNA IZQUIERDA: Controles y Confirmación */}
        <div className="flex flex-col space-y-6 md:col-span-5 lg:col-span-4">
          <section className="rounded-[24px] border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Paso 1</p>
                <Select
                  label="Selección de pista"
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
                  {selectedCourt && !reservationsQuery.loading && "Disponibilidad cargada. Selecciona una o varias horas libres en el calendario."}
                </div>
              </div>

              {allowsPartial && selectedCourt && (
                <div className="space-y-3 pt-2">
                  <Input
                    label="Número de personas (plazas)"
                    type="number"
                    min="1"
                    max={String(courtCapacity)}
                    value={numPersonas}
                    onChange={(event) => setNumPersonas(event.target.value)}
                  />
                  <div className="flex items-center justify-center rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-[#ffcc9f] font-medium">
                    Disponibles en franja: {availableUnitsForSelection} / {courtCapacity}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="flex flex-col rounded-[24px] border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Paso 4</p>
            <h2 className="mt-1 text-xl font-medium">Confirmación de reserva</h2>

            {!selection && (
              <div className="mt-4 flex flex-1 items-center justify-center rounded-xl border border-white/5 bg-black/10 p-4 text-center">
                <p className="text-sm text-gray-400">Aun no has seleccionado un horario en el calendario (Paso 3).</p>
              </div>
            )}

            {selection && (
              <div className="mt-4 flex flex-1 flex-col justify-center rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-gray-300">
                  <span className="font-medium text-white">Pista:</span> #{selectedCourt} <br />
                  <span className="font-medium text-white">Fecha:</span> {selection.date} <br />
                  <span className="font-medium text-white">Horario:</span> {String(selection.startHour).padStart(2, "0")}:00 - {String(selection.endHour).padStart(2, "0")}:00
                </p>
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-sm text-gray-400">Precio total estimado</p>
                  <p className="text-3xl font-semibold text-[#ffcc9f]">
                    {estimatedPrice !== null ? `${estimatedPrice.toFixed(2)} €` : "Calculando..."}
                  </p>
                </div>
              </div>
            )}

            {selectedRangeConflict && normalizedRole !== "CLUB" && normalizedRole !== "ADMIN" && (
              <div className="mt-3">
                <Toast kind="error" message="No hay disponibilidad suficiente en la pista seleccionada." />
              </div>
            )}

            <div className="mt-6">
              <Button
                className="w-full"
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

        {/* COLUMNA DERECHA: Calendario */}
        <div className="flex flex-col md:col-span-7 lg:col-span-8">
          {!selectedCourt ? (
            <section className="flex h-full min-h-[500px] items-center justify-center rounded-[24px] border border-white/15 bg-white/5 p-8 text-center backdrop-blur-sm">
              <div className="max-w-md space-y-2">
                <h3 className="text-xl font-medium">Calendario Semanal</h3>
                <p className="text-sm text-gray-400">Selecciona una pista en el Paso 1 para visualizar su disponibilidad y reservar tus horas.</p>
              </div>
            </section>
          ) : (
            <section className="flex h-full flex-col space-y-4 rounded-[24px] border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Paso 3: Selección de horas</p>
                <Button variant="secondary" onClick={() => reservationsQuery.refetch()}>
                  Refrescar disponibilidad
                </Button>
              </div>

              {reservationsQuery.error && (
                <Toast kind="error" message={reservationsQuery.error} />
              )}

              <div className="flex-1 rounded-xl bg-black/20 p-2">
                {reservationsQuery.loading ? (
                  <div className="flex h-full min-h-[400px] items-center justify-center">
                    <Spinner />
                  </div>
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
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
