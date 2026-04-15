import React from 'react';
import { cookies } from 'next/headers';

// 1. Definimos la interfaz según tu UserResponse de FastAPI
interface User {
  id: number;
  nombre: string;
  pri_ape: string;
  seg_ape?: string;
  email: string;
  telefono?: string;
  id_rol: number;
}

async function getUsers(): Promise<User[]> {
  try {
    // Obtenemos las cookies del navegador para pasarlas al backend (SSR)
    const cookieStore = await cookies();
    const token = cookieStore.toString();

    // IMPORTANTE: 'backend' es el nombre del servicio en docker-compose.yml
    const response = await fetch('http://backend:8000/users/getAll', {
      method: 'GET',
      headers: {
        'Cookie': token,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Para que siempre traiga datos frescos
    });

    if (response.status === 401 || response.status === 403) {
      console.error("Error de permisos: No estás logueado o no eres Admin");
      return [];
    }

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fallo crítico en el fetch:", error);
    throw error; // Esto activará el archivo error.tsx de Next.js si lo tienes
  }
}

export default async function GetAllUsersPage() {
  const users = await getUsers();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Usuarios</h1>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
          Admin Only
        </span>
      </div>

      <div className="relative overflow-x-auto shadow-lg sm:rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Nombre Completo</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Teléfono</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{user.id}</td>
                  <td className="px-6 py-4">
                    {user.nombre} {user.pri_ape} {user.seg_ape || ''}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-blue-600 underline">{user.email}</span>
                  </td>
                  <td className="px-6 py-4">{user.telefono || 'Sin teléfono'}</td>
                  <td className="px-6 py-4 text-center">
                    <button className="font-medium text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                    <button className="font-medium text-red-600 hover:text-red-900">Eliminar</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                  No se encontraron usuarios o no tienes permisos suficientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}