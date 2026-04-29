"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import Button from "@/app/components/UI/Button";
import Input from "@/app/components/UI/Input";
import Toast from "@/app/components/UI/Toast";
import { useAuth } from "@/context/AuthContext";
import { createPenalty } from "@/lib/services/penalties";
import { cancelReservation, searchReservations } from "@/lib/services/reservations";
import { ReservationSearchItem } from "@/lib/types";

const PAGE_SIZE = 20;

interface PenaltyModalState {
  open: boolean;
  reservation: ReservationSearchItem | null;
}

function isFutureReservation(reservation: ReservationSearchItem) {
  const startAt = new Date(`${reservation.fecha}T${reservation.hora_inicio}`);
  return startAt.getTime() > Date.now();
}

function isPastReservation(reservation: ReservationSearchItem) {
  const endAt = new Date(`${reservation.fecha}T${reservation.hora_fin}`);
  return endAt.getTime() <= Date.now();
}

export default function AdminReservasPage() {
  const { isAdmin } = useAuth();
  const [feedback, setFeedback] = useState<{ kind: "success" | "error" | "warning" | "info"; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ReservationSearchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [page, setPage] = useState(1);
  const [usuario, setUsuario] = useState("");
  const [fecha, setFecha] = useState("");

  const [penaltyState, setPenaltyState] = useState<PenaltyModalState>({ open: false, reservation: null });
  const [penaltyReason, setPenaltyReason] = useState("");
  const [savingPenalty, setSavingPenalty] = useState(false);

  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setFeedback(null);

      try {
        const response = await searchReservations({
          fecha: fecha || undefined,
          usuario: usuario || undefined,
          page,
          limit: PAGE_SIZE,
        });

        setRows(response.items);
        setTotal(response.total);
        setTotalPages(Math.max(1, response.total_pages));
      } catch (error) {
        setRows([]);
        setTotal(0);
        setTotalPages(1);
        setFeedback({
          kind: "error",
          message: error instanceof Error ? error.message : "No se pudieron cargar las reservas.",
        });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [page, usuario, fecha, refreshFlag]);

  const pageLabel = useMemo(() => {
    if (total === 0) return "Sin resultados";

    const from = (page - 1) * PAGE_SIZE + 1;
    const to = Math.min(page * PAGE_SIZE, total);
    return `Mostrando ${from}-${to} de ${total}`;
  }, [page, total]);

  const onCancel = async (reservation: ReservationSearchItem) => {
    if (!isFutureReservation(reservation)) {
      setFeedback({ kind: "warning", message: "No se puede cancelar una reserva pasada." });
      return;
    }

    setFeedback(null);

    try {
      await cancelReservation(reservation.id);
      setFeedback({ kind: "success", message: "Reserva cancelada correctamente." });
      setRefreshFlag((prev) => prev + 1);
    } catch (error) {
      setFeedback({
        kind: "error",
        message: error instanceof Error ? error.message : "No se pudo cancelar la reserva.",
      });
    }
  };

  const openPenaltyModal = (reservation: ReservationSearchItem) => {
    if (!isAdmin) {
      setFeedback({ kind: "warning", message: "Solo un administrador puede penalizar reservas." });
      return;
    }

    if (!isPastReservation(reservation)) {
      setFeedback({ kind: "warning", message: "Solo se puede penalizar una reserva que ya ha pasado." });
      return;
    }

    setPenaltyReason("");
    setPenaltyState({ open: true, reservation });
  };

  const closePenaltyModal = () => {
    setPenaltyState({ open: false, reservation: null });
    setPenaltyReason("");
  };

  const onPenaltySubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!penaltyState.reservation) return;

    const reason = penaltyReason.trim();
    if (!reason) {
      setFeedback({ kind: "warning", message: "El motivo de la penalizacion es obligatorio." });
      return;
    }

    setSavingPenalty(true);
    setFeedback(null);

    try {
      await createPenalty({
        id_reserva: penaltyState.reservation.id,
        motivo: reason,
        fecha_penalizacion: new Date().toISOString().slice(0, 10),
      });

      setFeedback({ kind: "success", message: "Penalizacion aplicada correctamente." });
      closePenaltyModal();
      setRefreshFlag((prev) => prev + 1);
    } catch (error) {
      setFeedback({
        kind: "error",
        message: error instanceof Error ? error.message : "No se pudo aplicar la penalizacion.",
      });
    } finally {
      setSavingPenalty(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-8">
      <h1 className="text-4xl font-medium tracking-tight">Admin · Reservas</h1>

      <section className="grid gap-3 rounded-[24px] border border-white/15 bg-white/5 p-4 backdrop-blur-sm md:grid-cols-4">
        <Input
          label="Buscar por usuario"
          value={usuario}
          onChange={(event) => {
            setPage(1);
            setUsuario(event.target.value);
          }}
          placeholder="Ej. Juan"
        />

        <Input
          label="Filtrar por fecha"
          type="date"
          value={fecha}
          onChange={(event) => {
            setPage(1);
            setFecha(event.target.value);
          }}
        />

        <div className="flex items-end">
          <Button variant="secondary" onClick={() => {
            setPage(1);
            setUsuario("");
            setFecha("");
          }}>
            Limpiar filtros
          </Button>
        </div>

        <div className="flex items-end justify-end text-sm text-gray-300">{pageLabel}</div>
      </section>

      {feedback && <Toast kind={feedback.kind} message={feedback.message} />}

      <section className="overflow-hidden rounded-[24px] border border-white/15 bg-white/5 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-white/10 bg-black/20 text-left text-gray-200">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Espacio</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Franja</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!loading && rows.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-gray-400" colSpan={7}>No hay reservas para los filtros aplicados.</td>
                </tr>
              )}

              {rows.map((row) => {
                const canCancel = isFutureReservation(row);
                const canPenalize = isAdmin && isPastReservation(row);

                return (
                  <tr key={row.id} className="border-b border-white/10">
                    <td className="px-4 py-3">{row.id}</td>
                    <td className="px-4 py-3">{row.id_espacio}</td>
                    <td className="px-4 py-3">{row.usuario_nombre}</td>
                    <td className="px-4 py-3">{row.fecha} · {row.hora_inicio} - {row.hora_fin}</td>
                    <td className="px-4 py-3">{Number(row.precio_total || 0).toFixed(2)} €</td>
                    <td className="px-4 py-3">{row.estado}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {canCancel && (
                          <Button variant="danger" onClick={() => onCancel(row)}>
                            Cancelar
                          </Button>
                        )}
                        {canPenalize && (
                          <Button variant="secondary" onClick={() => openPenaltyModal(row)}>
                            Penalizar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="secondary"
          disabled={page <= 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Anterior
        </Button>
        <span className="text-sm text-gray-300">Pagina {page} de {totalPages}</span>
        <Button
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        >
          Siguiente
        </Button>
      </div>

      {penaltyState.open && penaltyState.reservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#0f1115] p-5">
            <h2 className="text-xl font-medium">Aplicar penalizacion</h2>
            <p className="mt-1 text-sm text-gray-300">
              Reserva #{penaltyState.reservation.id} · Usuario: {penaltyState.reservation.usuario_nombre}
            </p>

            <form className="mt-4 space-y-3" onSubmit={onPenaltySubmit}>
              <Input
                label="Motivo"
                value={penaltyReason}
                onChange={(event) => setPenaltyReason(event.target.value)}
                placeholder="Describe el motivo de la penalizacion"
                required
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={savingPenalty}>
                  {savingPenalty ? "Guardando..." : "Guardar penalizacion"}
                </Button>
                <Button type="button" variant="secondary" onClick={closePenaltyModal}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
