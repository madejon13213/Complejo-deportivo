"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import Sidebar from "@/app/components/Layout/Sidebar";
import Spinner from "@/app/components/UI/Spinner";
import Toast from "@/app/components/UI/Toast";
import Pagination from "@/app/components/UI/Pagination";
import { useAuth } from "@/context/AuthContext";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { getPenaltiesByUserAsAdmin } from "@/lib/services/penalties";
import { getReservationsByUserAsAdmin } from "@/lib/services/reservations";
import { getUserById } from "@/lib/services/users";
import { User, ReservationSearchResponse, PenaltySearchResponse } from "@/lib/types";

const LIMIT = 5;

export default function AdminUserProfilePage() {
  const params = useParams<{ id: string }>();
  const { isAdmin, isReady } = useAuth();
  const [activeTab, setActiveTab] = useState<"reservas" | "penalizaciones">("reservas");
  const [resPage, setResPage] = useState(1);
  const [penPage, setPenPage] = useState(1);

  const userId = Number(params.id);

  const userQuery = useApiQuery<User>(() => getUserById(userId), [userId], {
    enabled: isReady && isAdmin && Number.isFinite(userId),
  });

  const reservationsQuery = useApiQuery<ReservationSearchResponse>(
    () => getReservationsByUserAsAdmin(userId, resPage, LIMIT),
    [userId, resPage],
    { enabled: isReady && isAdmin && Number.isFinite(userId) }
  );

  const penaltiesQuery = useApiQuery<PenaltySearchResponse>(
    () => getPenaltiesByUserAsAdmin(userId, penPage, LIMIT),
    [userId, penPage],
    { enabled: isReady && isAdmin && Number.isFinite(userId) }
  );

  const content = useMemo(() => {
    if (activeTab === "reservas") {
      if (reservationsQuery.loading) return <Spinner />;
      if (reservationsQuery.error) return <Toast kind="error" message={reservationsQuery.error} />;
      const reservations = reservationsQuery.data?.items || [];
      const totalPages = reservationsQuery.data?.total_pages || 0;

      if (!reservations.length) {
        return <p className="text-sm text-gray-300">Este usuario no tiene reservas registradas.</p>;
      }

      return (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-white/10 text-left text-gray-300">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Espacio</th>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Hora</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="border-b border-white/10">
                    <td className="px-3 py-2">{reservation.id}</td>
                    <td className="px-3 py-2">{reservation.id_espacio}</td>
                    <td className="px-3 py-2">{reservation.fecha}</td>
                    <td className="px-3 py-2">{reservation.hora_inicio} - {reservation.hora_fin}</td>
                    <td className="px-3 py-2">{Number(reservation.precio_total || 0).toFixed(2)} €</td>
                    <td className="px-3 py-2">{reservation.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination 
            currentPage={resPage} 
            totalPages={totalPages} 
            onPageChange={setResPage} 
          />
        </div>
      );
    }

    if (penaltiesQuery.loading) return <Spinner />;
    if (penaltiesQuery.error) return <Toast kind="error" message={penaltiesQuery.error} />;

    const penalties = penaltiesQuery.data?.items || [];
    const totalPages = penaltiesQuery.data?.total_pages || 0;

    if (!penalties.length) {
      return <p className="text-sm text-gray-300">Este usuario no tiene penalizaciones registradas.</p>;
    }

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-white/10 text-left text-gray-300">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Reserva</th>
                <th className="px-3 py-2">Motivo</th>
                <th className="px-3 py-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {penalties.map((penalty) => (
                <tr key={penalty.id} className="border-b border-white/10">
                  <td className="px-3 py-2">{penalty.id}</td>
                  <td className="px-3 py-2">{penalty.id_reserva}</td>
                  <td className="px-3 py-2">{penalty.tipo_penalizacion}</td>
                  <td className="px-3 py-2">{penalty.fecha_inicio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination 
          currentPage={penPage} 
          totalPages={totalPages} 
          onPageChange={setPenPage} 
        />
      </div>
    );
  }, [activeTab, penaltiesQuery.data, penaltiesQuery.error, penaltiesQuery.loading, reservationsQuery.data, reservationsQuery.error, reservationsQuery.loading, resPage, penPage]);

  if (!isReady) {
    return (
      <div className="mx-auto max-w-7xl p-8">
        <Spinner />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-7xl p-8">
        <Toast kind="error" message="Acceso denegado. Solo administradores." />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl">
      <Sidebar />
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <h1 className="text-3xl text-white">Perfil de usuario</h1>

        {userQuery.loading && <Spinner />}
        {userQuery.error && <Toast kind="error" message={userQuery.error} />}

        {userQuery.data && (
          <section className="rounded-2xl border border-white/15 bg-black/35 p-5 backdrop-blur-sm">
            <p className="text-lg text-white">{userQuery.data.nombre} {userQuery.data.pri_ape}</p>
            <p className="text-sm text-gray-300">{userQuery.data.email}</p>
            <p className="text-sm text-gray-300">Rol: {userQuery.data.rol || "CLIENTE"}</p>
          </section>
        )}

        <section className="rounded-2xl border border-white/15 bg-black/35 p-4 backdrop-blur-sm">
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("reservas")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                activeTab === "reservas" ? "bg-[#5c7bff] text-white" : "bg-white/10 text-gray-200"
              }`}
            >
              Ver Reservas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("penalizaciones")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                activeTab === "penalizaciones" ? "bg-[#5c7bff] text-white" : "bg-white/10 text-gray-200"
              }`}
            >
              Ver Penalizaciones
            </button>
          </div>

          {content}
        </section>
      </div>
    </div>
  );
}
