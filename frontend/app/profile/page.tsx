"use client";

import { ReactNode, useEffect, useState } from "react";
import { AlertTriangle, Calendar, Clock, LogOut, Settings } from "lucide-react";

import ConfirmDeleteModal from "@/app/components/Modals/ConfirmDeleteModal";
import ChangePasswordModal from "@/app/components/Modals/ChangePasswordModal";
import Button from "@/app/components/UI/Button";
import Toast from "@/app/components/UI/Toast";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { getReservationsByUser } from "@/lib/services/reservations";
import { getPenaltiesByUser } from "@/lib/services/penalties";
import { deleteUser } from "@/lib/services/users";
import { User } from "@/lib/types";

export default function ProfilePage() {
  const { logout, role, userId } = useAuth();
  const [openPassword, setOpenPassword] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const [userData, setUserData] = useState<User | null>(null);
  const [resCount, setResCount] = useState(0);
  const [penCount, setPenCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!userId) return;
      try {
        const [me, resResp, penResp] = await Promise.all([
          apiFetch<User>("/users/me"),
          getReservationsByUser(Number(userId), 1, 1),
          getPenaltiesByUser(Number(userId), 1, 1)
        ]);
        setUserData(me);
        setResCount(resResp.total);
        setPenCount(penResp.total);
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  const onDeleteAccount = async () => {
    if (!userId) return;
    try {
      await deleteUser(Number(userId));
      await logout();
    } catch (error) {
      setFeedback({
        kind: "error",
        message: error instanceof Error ? error.message : "No se pudo eliminar la cuenta.",
      });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-8">
      <h1 className="text-3xl text-white">Mi perfil</h1>
      {feedback && <Toast kind={feedback.kind} message={feedback.message} />}

      <section className="rounded-2xl border border-white/15 bg-black/35 p-6 text-white backdrop-blur-sm">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#5c7bff] text-xl font-semibold text-white">
          {userData?.nombre?.charAt(0) || "U"}
        </div>
        <div className="grid gap-3 md:grid-cols-2 text-gray-100">
          <p>
            <strong className="text-white">Nombre:</strong>{" "}
            {loading ? "Cargando..." : `${userData?.nombre} ${userData?.pri_ape}`}
          </p>
          <p>
            <strong className="text-white">Email:</strong>{" "}
            {loading ? "Cargando..." : userData?.email}
          </p>
          <p>
            <strong className="text-white">Teléfono:</strong>{" "}
            {loading ? "Cargando..." : userData?.telefono || "No especificado"}
          </p>
          <p>
            <strong className="text-white">Rol:</strong> {role || "cliente"}
          </p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          icon={<Calendar size={16} />}
          label="Total reservas"
          value={loading ? "..." : resCount.toString()}
        />
        <Card
          icon={<Clock size={16} />}
          label="Estado actual"
          value={loading ? "..." : "Activo"}
        />
        <Card
          icon={<AlertTriangle size={16} />}
          label="Penalizaciones"
          value={loading ? "..." : penCount.toString()}
        />
      </section>

      <section className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          icon={<Settings size={16} />}
          onClick={() => setOpenPassword(true)}
        >
          Cambiar contraseña
        </Button>
        <Button variant="danger" onClick={() => setOpenDelete(true)}>
          Eliminar cuenta
        </Button>
        <Button icon={<LogOut size={16} />} onClick={logout}>
          Cerrar sesión
        </Button>
      </section>

      <ChangePasswordModal open={openPassword} onClose={() => setOpenPassword(false)} />

      <ConfirmDeleteModal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={onDeleteAccount}
        message="¿Estás completamente seguro de que deseas eliminar tu cuenta? Esta acción es permanente y perderás todas tus reservas y datos."
      />
    </div>
  );
}

function Card({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-white/15 bg-black/35 p-4 text-white backdrop-blur-sm">
      <div className="mb-2 inline-flex rounded-lg bg-white/10 p-2 text-[#88a0ff]">{icon}</div>
      <p className="text-xs text-gray-300">{label}</p>
      <p className="text-xl font-semibold text-white">{value}</p>
    </article>
  );
}
