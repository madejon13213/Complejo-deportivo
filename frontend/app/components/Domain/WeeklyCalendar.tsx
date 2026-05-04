"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { CalendarRange, formatLabelDate, getHoursRange, getWeekDays, isPastSlot, toIsoDate } from "@/lib/date";
import { Reservation } from "@/lib/types";

interface WeeklyCalendarProps {
  reservations: Reservation[];
  role: string | null;
  userId: number | null;
  courtCapacity?: number;
  allowsPartial?: boolean;
  onSelectionChange?: (range: CalendarRange | null) => void;
  weekBaseDate?: Date;
}

interface SlotState {
  reservations: Reservation[];
  occupiedUnits: number;
  isFull: boolean;
  isPartial: boolean;
  hasOwnReservation: boolean;
}

function toHour(value: string): number {
  return Number(value.slice(0, 2));
}

export default function WeeklyCalendar({
  reservations,
  role,
  userId,
  courtCapacity,
  allowsPartial,
  onSelectionChange,
  weekBaseDate = new Date(),
}: WeeklyCalendarProps) {
  const days = useMemo(() => getWeekDays(weekBaseDate), [weekBaseDate]);
  const hours = useMemo(() => getHoursRange(), []);
  const capacity = Math.max(1, courtCapacity || 1);
  const partialEnabled = Boolean(allowsPartial);
  const normalizedRole = (role || "CLIENTE").toUpperCase();

  const [anchor, setAnchor] = useState<{ date: string; hour: number } | null>(null);
  const [selected, setSelected] = useState<CalendarRange | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [mobileDayIndex, setMobileDayIndex] = useState(0);

  const reservationsByDay = useMemo(() => {
    return reservations.reduce<Record<string, Reservation[]>>((acc, reservation) => {
      const key = reservation.fecha;
      if (!acc[key]) acc[key] = [];
      acc[key].push(reservation);
      return acc;
    }, {});
  }, [reservations]);

  const getSlotState = (dateIso: string, hour: number): SlotState => {
    const rows = (reservationsByDay[dateIso] || []).filter((reservation) => {
      const start = toHour(reservation.hora_inicio);
      const end = toHour(reservation.hora_fin);
      return hour >= start && hour < end && reservation.estado.toLowerCase() !== "cancelada";
    });

    const occupiedUnits = rows.reduce((sum, reservation) => {
      if (reservation.tipo_reserva === "parcial" && partialEnabled) {
        return sum + Math.max(1, reservation.plazas_parciales || 1);
      }
      return sum + capacity;
    }, 0);

    const boundedUnits = Math.min(capacity, occupiedUnits);

    return {
      reservations: rows,
      occupiedUnits: boundedUnits,
      isFull: boundedUnits >= capacity,
      isPartial: partialEnabled && boundedUnits > 0 && boundedUnits < capacity,
      hasOwnReservation: rows.some((reservation) => reservation.id_user === userId),
    };
  };

  const handleCellClick = (dateIso: string, hour: number) => {
    setWarning(null);

    if (isPastSlot(dateIso, hour)) {
      return;
    }

    const slotState = getSlotState(dateIso, hour);
    if (slotState.isFull && normalizedRole !== "CLUB" && normalizedRole !== "ADMIN") {
      return;
    }

    if (!anchor || anchor.date !== dateIso) {
      const next = { date: dateIso, hour };
      setAnchor(next);
      setSelected({ date: dateIso, startHour: hour, endHour: hour + 1 });
      onSelectionChange?.({ date: dateIso, startHour: hour, endHour: hour + 1 });
      return;
    }

    const startHour = Math.min(anchor.hour, hour);
    const endHour = Math.max(anchor.hour, hour) + 1;

    if (normalizedRole === "CLIENTE" && endHour - startHour > 2) {
      setWarning("Como cliente solo puedes reservar un maximo de 2 horas consecutivas.");
      return;
    }

    const nextRange = { date: dateIso, startHour, endHour };
    setSelected(nextRange);
    onSelectionChange?.(nextRange);
  };

  const isSelected = (dateIso: string, hour: number) => {
    if (!selected || selected.date !== dateIso) return false;
    return hour >= selected.startHour && hour < selected.endHour;
  };

  const renderMobileDay = () => {
    const day = days[mobileDayIndex];
    const dayIso = toIsoDate(day);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg border border-white/15 bg-black/30 px-3 py-2">
          <button
            onClick={() => setMobileDayIndex((i) => Math.max(0, i - 1))}
            disabled={mobileDayIndex === 0}
            className="rounded-md p-1 text-white hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-gray-100">{formatLabelDate(day)}</span>
          <button
            onClick={() => setMobileDayIndex((i) => Math.min(days.length - 1, i + 1))}
            disabled={mobileDayIndex === days.length - 1}
            className="rounded-md p-1 text-white hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="space-y-1">
          {hours.map((hour) => {
            const slotState = getSlotState(dayIso, hour);
            const past = isPastSlot(dayIso, hour);
            const selectedCell = isSelected(dayIso, hour);

            let cellClass = "border-emerald-400/35 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30";
            let label = "Libre";

            if (slotState.isPartial) {
              cellClass = "border-amber-400/40 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30";
              label = `${slotState.occupiedUnits}/${capacity}`;
            }

            if (slotState.isFull) {
              cellClass =
                normalizedRole === "CLUB" || normalizedRole === "ADMIN"
                  ? "border-red-400/45 bg-red-500/25 text-red-100 hover:bg-red-500/35"
                  : "border-red-400/45 bg-red-500/30 text-red-100";
              label = "Ocupado";
            }

            if (slotState.hasOwnReservation) {
              cellClass = "border-blue-400/45 bg-blue-500/25 text-blue-100 hover:bg-blue-500/35";
              label = "Tu reserva";
            }

            if (past) {
              cellClass = "border-slate-500/40 bg-slate-500/30 text-slate-100";
              label = "Pasado";
            }

            if (selectedCell) {
              cellClass = "border-[#e8863a] bg-[#e8863a]/35 text-white";
              label = "Seleccionado";
            }

            const title = partialEnabled
              ? `Ocupacion ${slotState.occupiedUnits}/${capacity}`
              : slotState.isFull
                ? "Ocupado"
                : "Disponible";

            return (
              <div key={hour} className="grid grid-cols-[60px_1fr] gap-1 text-xs">
                <div className="flex items-center justify-center rounded-md border border-white/15 bg-black/30 px-2 py-2 text-center font-semibold text-gray-100">
                  {String(hour).padStart(2, "0")}:00
                </div>
                <button
                  type="button"
                  onClick={() => handleCellClick(dayIso, hour)}
                  className={`h-10 rounded-md border text-[11px] font-semibold transition ${cellClass}`}
                  disabled={past || (slotState.isFull && normalizedRole !== "CLUB" && normalizedRole !== "ADMIN")}
                  title={title}
                >
                  {label}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-3 rounded-2xl border border-white/15 bg-black/35 p-4 backdrop-blur-sm">
      {warning && <p className="rounded-lg border border-yellow-400/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-200">{warning}</p>}

      {/* Mobile: One day at a time */}
      <div className="md:hidden">
        {renderMobileDay()}
      </div>

      {/* Desktop: Full week grid */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))] gap-1 text-xs">
              <div />
              {days.map((day) => (
                <div key={day.toISOString()} className="rounded-lg border border-white/15 bg-black/30 px-2 py-2 text-center font-semibold text-gray-100">
                  {formatLabelDate(day)}
                </div>
              ))}

              {hours.map((hour) => (
                <Fragment key={`hour-${hour}`}>
                  <div className="rounded-lg border border-white/15 bg-black/30 px-2 py-2 text-center font-semibold text-gray-100">
                    {String(hour).padStart(2, "0")}:00
                  </div>
                  {days.map((day) => {
                    const dayIso = toIsoDate(day);
                    const slotState = getSlotState(dayIso, hour);
                    const past = isPastSlot(dayIso, hour);
                    const selectedCell = isSelected(dayIso, hour);

                    let cellClass = "border-emerald-400/35 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30";
                    let label = "Libre";

                    if (slotState.isPartial) {
                      cellClass = "border-amber-400/40 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30";
                      label = `${slotState.occupiedUnits}/${capacity}`;
                    }

                    if (slotState.isFull) {
                      cellClass =
                        normalizedRole === "CLUB" || normalizedRole === "ADMIN"
                          ? "border-red-400/45 bg-red-500/25 text-red-100 hover:bg-red-500/35"
                          : "border-red-400/45 bg-red-500/30 text-red-100";
                      label = "Ocupado";
                    }

                    if (slotState.hasOwnReservation) {
                      cellClass = "border-blue-400/45 bg-blue-500/25 text-blue-100 hover:bg-blue-500/35";
                      label = "Tu reserva";
                    }

                    if (past) {
                      cellClass = "border-slate-500/40 bg-slate-500/30 text-slate-100";
                      label = "Pasado";
                    }

                    if (selectedCell) {
                      cellClass = "border-[#e8863a] bg-[#e8863a]/35 text-white";
                      label = "Seleccionado";
                    }

                    const title = partialEnabled
                      ? `Ocupacion ${slotState.occupiedUnits}/${capacity}`
                      : slotState.isFull
                        ? "Ocupado"
                        : "Disponible";

                    return (
                      <button
                        key={`${dayIso}-${hour}`}
                        type="button"
                        onClick={() => handleCellClick(dayIso, hour)}
                        className={`h-10 rounded-md border text-[11px] font-semibold transition ${cellClass}`}
                        disabled={past || (slotState.isFull && normalizedRole !== "CLUB" && normalizedRole !== "ADMIN")}
                        title={title}
                      >
                        {label}
                      </button>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
