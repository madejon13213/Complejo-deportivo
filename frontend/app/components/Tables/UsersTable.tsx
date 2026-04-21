import { Edit, Eye, Trash2, User } from "lucide-react";
import { User as UserType } from "@/lib/types";

interface UsersTableProps {
  users: UserType[];
}

export default function UsersTable({ users }: UsersTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-acero bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-nieve text-left">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Teléfono</th>
            <th className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-acero">
              <td className="px-4 py-3">{user.id}</td>
              <td className="px-4 py-3 inline-flex items-center gap-2">
                <User size={14} /> {user.nombre} {user.pri_ape}
              </td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">{user.telefono || "-"}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Eye size={16} />
                  <Edit size={16} />
                  <Trash2 size={16} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
