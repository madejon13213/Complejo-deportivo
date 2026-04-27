"use client";

import { FormEvent, useState } from "react";

import Button from "@/app/components/UI/Button";
import Input from "@/app/components/UI/Input";
import Toast from "@/app/components/UI/Toast";
import { createPenalty } from "@/lib/services/penalties";

interface PenalizationFormProps {
  onSuccess?: () => void;
}

export default function PenalizationForm({ onSuccess }: PenalizationFormProps) {
  const [open, setOpen] = useState(false);
  const [idReserva, setIdReserva] = useState("");
  const [motivo, setMotivo] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    setLoading(true);

    try {
      await createPenalty({
        id_reserva: Number(idReserva),
        motivo,
        fecha_penalizacion: new Date().toISOString().slice(0, 10),
      });
      setFeedback({ kind: "success", message: "Penalizacion creada correctamente." });
      onSuccess?.();
      setTimeout(() => setOpen(false), 800);
    } catch (error) {
      setFeedback({
        kind: "error",
        message: error instanceof Error ? error.message : "No se pudo crear la penalizacion.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return <Button onClick={() => setOpen(true)}>Anadir penalizacion</Button>;
  }

  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
      <form className="space-y-3" onSubmit={onSubmit}>
        <h3 className="text-lg font-medium">Nueva penalizacion</h3>
        {feedback && <Toast kind={feedback.kind} message={feedback.message} />}
        <Input label="ID reserva" type="number" value={idReserva} onChange={(e) => setIdReserva(e.target.value)} required />
        <Input label="Motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} required />
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
