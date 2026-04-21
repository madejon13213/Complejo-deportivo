"use client";

import { useMemo, useState } from "react";
import { CheckCircle, Calendar, Clock, MapPin } from "lucide-react";
import Button from "@/app/components/UI/Button";
import DatePicker from "@/app/components/UI/DatePicker";
import TimePicker from "@/app/components/UI/TimePicker";
import Toast from "@/app/components/UI/Toast";

interface ReservationFormProps {
  courtOptions: Array<{ id: number; name: string; price: number; capacity: number }>;
}

export default function ReservationForm({ courtOptions }: ReservationFormProps) {
  const [step, setStep] = useState(1);
  const [courtId, setCourtId] = useState<number | null>(courtOptions[0]?.id ?? null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const selectedCourt = useMemo(() => courtOptions.find((court) => court.id === courtId), [courtId, courtOptions]);

  return (
    <section className="space-y-4 rounded-2xl border border-acero bg-white p-5">
      <p className="text-sm text-gray-500">Paso {step} de 4</p>

      {step === 1 && (
        <div className="grid gap-3 md:grid-cols-2">
          {courtOptions.map((court) => (
            <button
              key={court.id}
              type="button"
              onClick={() => setCourtId(court.id)}
              className={`rounded-xl border p-4 text-left ${courtId === court.id ? "border-azul-pro" : "border-acero"}`}
            >
              <p className="font-semibold">{court.name}</p>
              <p className="text-sm text-gray-600">{court.price} €/h · Capacidad {court.capacity}</p>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-3 md:grid-cols-2">
          <DatePicker label="Fecha" value={date} onChange={(e) => setDate(e.target.value)} />
          <TimePicker label="Hora inicio" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <TimePicker label="Hora fin" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-2">
          <Toast kind="success" message="Horario disponible" />
          <p className="text-sm text-gray-600">Si hay conflicto, se mostrará en rojo.</p>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-2 text-sm">
          <p className="inline-flex items-center gap-2"><MapPin size={14} /> {selectedCourt?.name}</p>
          <p className="inline-flex items-center gap-2"><Calendar size={14} /> {date || "Sin fecha"}</p>
          <p className="inline-flex items-center gap-2"><Clock size={14} /> {startTime || "--"} - {endTime || "--"}</p>
          {confirmed && <Toast kind="success" message="Reserva confirmada" />}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="secondary" disabled={step === 1} onClick={() => setStep((prev) => Math.max(1, prev - 1))}>
          Anterior
        </Button>
        {step < 4 ? (
          <Button onClick={() => setStep((prev) => Math.min(4, prev + 1))}>Siguiente</Button>
        ) : (
          <Button icon={<CheckCircle size={16} />} onClick={() => setConfirmed(true)}>
            Confirmar reserva
          </Button>
        )}
      </div>
    </section>
  );
}
