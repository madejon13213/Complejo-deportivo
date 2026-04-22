"use client";

import { Fragment, useMemo, useState } from "react";
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

  const [anchor, setAnchor] = useState<{ date: string; hour: number } | null>(null);
  const [selected, setSelected] = useState<CalendarRange | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

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
      return hour >= start && hour < end && reservation.estado !== "cancelada";
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
    if (slotState.isFull && role !== "club") {
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

    if (role === "cliente" && endHour - startHour > 2) {
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

  return (
    <section className="space-y-3 rounded-2xl border border-acero bg-white p-4">
      {warning && <p className="rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-700">{warning}</p>}
      <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))] gap-1 text-xs">
        <div />
        {days.map((day) => (
          <div key={day.toISOString()} className="rounded-lg bg-nieve px-2 py-2 text-center font-semibold text-carbon">
            {formatLabelDate(day)}
          </div>
        ))}

        {hours.map((hour) => (
          <Fragment key={`hour-${hour}`}>
            <div className="rounded-lg bg-nieve px-2 py-2 text-center font-semibold text-gray-600">
              {String(hour).padStart(2, "0")}:00
            </div>
            {days.map((day) => {
              const dayIso = toIsoDate(day);
              const slotState = getSlotState(dayIso, hour);
              const past = isPastSlot(dayIso, hour);
              const selectedCell = isSelected(dayIso, hour);

              let cellClass = "bg-green-100 hover:bg-green-200";
              let label = "Libre";

              if (slotState.isPartial) {
                cellClass = "bg-amber-100 hover:bg-amber-200";
                label = `${slotState.occupiedUnits}/${capacity}`;
              }

              if (slotState.isFull) {
                cellClass = role === "club" ? "bg-red-200 hover:bg-red-300" : "bg-red-300";
                label = "Ocupado";
              }

              if (slotState.hasOwnReservation) {
                cellClass = "bg-blue-200";
                label = "Tu reserva";
              }

              if (past) {
                cellClass = "bg-gray-200";
                label = "Pasado";
              }

              if (selectedCell) {
                cellClass = "bg-lime-neon";
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
                  className={`h-10 rounded-md border border-acero text-[10px] transition ${cellClass}`}
                  disabled={past || (slotState.isFull && role !== "club")}
                  title={title}
                >
                  {label}
                </button>
              );
            })}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
