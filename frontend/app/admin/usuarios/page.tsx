"use client";

import Link from "next/link";
import { useState } from "react";

import DataTable from "@/app/components/Tables/DataTable";
import Button from "@/app/components/UI/Button";
import Toast from "@/app/components/UI/Toast";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { deleteUser, getUsers } from "@/lib/services/users";
import { User } from "@/lib/types";

export default function AdminUsuariosPage() {
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const usersQuery = useApiQuery<User[]>(() => getUsers(), []);

  const onDelete = async (id: number) => {
    setFeedback(null);
    try {
      await deleteUser(id);
      setFeedback({ kind: "success", message: "Usuario eliminado correctamente." });
      await usersQuery.refetch();
    } catch (error) {
      setFeedback({ kind: "error", message: error instanceof Error ? error.message : "No se pudo eliminar el usuario." });
    }
  };

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (row: User) => row.id,
      searchable: (row: User) => String(row.id),
    },
    {
      key: "nombre",
      header: "Nombre",
      render: (row: User) => `${row.nombre} ${row.pri_ape}`,
      searchable: (row: User) => `${row.nombre} ${row.pri_ape} ${row.seg_ape || ""}`,
    },
    {
      key: "email",
      header: "Email",
      render: (row: User) => row.email,
      searchable: (row: User) => row.email,
    },
    {
      key: "rol",
      header: "Rol",
      render: (row: User) => row.rol || "CLIENTE",
      searchable: (row: User) => row.rol || "CLIENTE",
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (row: User) => (
        <div className="flex gap-2">
          <Link href={`/profile/${row.id}`}>
            <Button variant="secondary">Detalle</Button>
          </Link>
          <Button variant="danger" onClick={() => onDelete(row.id)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-8">
      <h1 className="text-3xl">Admin · Usuarios</h1>
      {feedback && <Toast kind={feedback.kind} message={feedback.message} />}
      {usersQuery.error && <Toast kind="error" message={usersQuery.error} />}
      <DataTable rows={usersQuery.data || []} columns={columns} emptyMessage="No hay usuarios registrados." />
    </div>
  );
}