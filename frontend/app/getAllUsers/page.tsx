"use client";

import { useMemo, useState } from "react";
import UserFilters from "@/app/components/Filters/UserFilters";
import UsersTable from "@/app/components/Tables/UsersTable";
import Pagination from "@/app/components/Pagination/Pagination";
import { User } from "@/lib/types";

const rows: User[] = [
  { id: 1, nombre: "Ana", pri_ape: "López", email: "ana@mail.com", telefono: "600111222", rol: "administrador" },
  { id: 2, nombre: "Carlos", pri_ape: "Pérez", email: "carlos@mail.com", telefono: "600222333", rol: "cliente" },
  { id: 3, nombre: "Marta", pri_ape: "Soto", email: "marta@mail.com", telefono: "600333444", rol: "cliente" },
];

export default function GetAllUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => rows.filter((user) => `${user.nombre} ${user.pri_ape} ${user.email}`.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-8">
      <h1 className="text-3xl">Gestión de usuarios</h1>
      <UserFilters search={search} setSearch={setSearch} />
      <UsersTable users={filtered} />
      <Pagination page={page} totalPages={1} onPageChange={setPage} />
    </div>
  );
}
