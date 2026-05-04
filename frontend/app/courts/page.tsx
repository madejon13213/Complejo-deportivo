"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CourtCard from "@/app/components/Cards/CourtCard";
import CourtFilters from "@/app/components/Filters/CourtFilters";
import Spinner from "@/app/components/UI/Spinner";
import Toast from "@/app/components/UI/Toast";
import Pagination from "@/app/components/UI/Pagination";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { getCourts, createCourt, updateCourt, deleteCourt } from "@/lib/services/courts";
import { getAllSpaces } from "@/lib/services/spaces";
import { CourtSearchResponse, SpaceType, Court } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

const LIMIT = 8;

export default function CourtsPage() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("spaceType");
  const { isAdmin } = useAuth();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeId, setTypeId] = useState<number | undefined>(initialType ? Number(initialType) : undefined);
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [deletingCourt, setDeletingCourt] = useState<Court | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    precio_hora: "",
    capacidad: "",
    precio_hora_parcial: "",
    id_tipo_espacio: "",
  });
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch all space types for the filter dropdown
  const { data: spaceTypes } = useApiQuery<SpaceType[]>(() => getAllSpaces(), []);

  // Sync with URL param if it changes
  useEffect(() => {
    if (initialType) {
      setTypeId(Number(initialType));
      setPage(1);
    }
  }, [initialType]);

  const courtsQuery = useApiQuery<CourtSearchResponse>(
    () => getCourts(page, LIMIT, { search: debouncedSearch, typeId }),
    [page, debouncedSearch, typeId]
  );

  const handleCreate = async () => {
    try {
      await createCourt({
        nombre: formData.nombre,
        precio_hora: parseFloat(formData.precio_hora),
        capacidad: parseInt(formData.capacidad),
        precio_hora_parcial: formData.precio_hora_parcial ? parseFloat(formData.precio_hora_parcial) : undefined,
        id_tipo_espacio: parseInt(formData.id_tipo_espacio),
      });
      setToast({ kind: "success", message: "Pista creada correctamente" });
      setShowCreateModal(false);
      resetForm();
      courtsQuery.refetch();
    } catch (error) {
      setToast({ kind: "error", message: "Error al crear pista" });
    }
  };

  const handleEdit = async () => {
    if (!editingCourt) return;
    try {
      await updateCourt(editingCourt.id, {
        nombre: formData.nombre,
        precio_hora: parseFloat(formData.precio_hora),
        capacidad: parseInt(formData.capacidad),
        precio_hora_parcial: formData.precio_hora_parcial ? parseFloat(formData.precio_hora_parcial) : null,
        id_tipo_espacio: parseInt(formData.id_tipo_espacio),
      });
      setToast({ kind: "success", message: "Pista actualizada correctamente" });
      setEditingCourt(null);
      resetForm();
      courtsQuery.refetch();
    } catch (error) {
      setToast({ kind: "error", message: "Error al actualizar pista" });
    }
  };

  const handleDelete = async () => {
    if (!deletingCourt) return;
    try {
      await deleteCourt(deletingCourt.id);
      setToast({ kind: "success", message: "Pista eliminada correctamente" });
      setDeletingCourt(null);
      courtsQuery.refetch();
    } catch (error) {
      setToast({ kind: "error", message: "Error al eliminar pista" });
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      precio_hora: "",
      capacidad: "",
      precio_hora_parcial: "",
      id_tipo_espacio: "",
    });
  };

  const openEditModal = (court: Court) => {
    setEditingCourt(court);
    setFormData({
      nombre: court.nombre,
      precio_hora: court.precio_hora?.toString() || "",
      capacidad: court.capacidad?.toString() || "",
      precio_hora_parcial: court.precio_hora_parcial?.toString() || "",
      id_tipo_espacio: court.id_tipo_espacio?.toString() || "",
    });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleTypeChange = (id?: number) => {
    setTypeId(id);
    setPage(1);
  };

  const items = courtsQuery.data?.items || [];

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Pistas disponibles</h1>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Crear Pista
          </button>
        )}
      </div>
      <CourtFilters 
        search={search} 
        setSearch={handleSearch} 
        typeId={typeId}
        setTypeId={handleTypeChange}
        spaceTypes={spaceTypes || []}
      />
      
      {courtsQuery.loading && <Spinner />}
      {courtsQuery.error && <Toast kind="error" message={courtsQuery.error} />}
      {toast && <Toast kind={toast.kind} message={toast.message} />}
      
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((court) => (
            <CourtCard 
              key={court.id} 
              court={court} 
              isAdmin={isAdmin}
              onEdit={() => openEditModal(court)}
              onDelete={() => setDeletingCourt(court)}
            />
          ))}
        </div>

        {!courtsQuery.loading && items.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-gray-300 text-lg font-medium">No se encontraron pistas que coincidan con tu búsqueda.</p>
            <p className="text-gray-500 text-sm mt-1">Prueba a ajustar los filtros o limpiar el buscador.</p>
          </div>
        )}

        {courtsQuery.data && (
          <Pagination 
            currentPage={page} 
            totalPages={courtsQuery.data.total_pages} 
            onPageChange={setPage} 
          />
        )}
      </div>

      <CourtModal
        isOpen={showCreateModal || !!editingCourt}
        onClose={() => {
          setShowCreateModal(false);
          setEditingCourt(null);
          resetForm();
        }}
        onSubmit={editingCourt ? handleEdit : handleCreate}
        formData={formData}
        setFormData={setFormData}
        spaceTypes={spaceTypes || []}
        isEditing={!!editingCourt}
      />

      <DeleteModal
        isOpen={!!deletingCourt}
        onClose={() => setDeletingCourt(null)}
        onConfirm={handleDelete}
        court={deletingCourt}
      />
    </div>
  );
}

// Modal for Create/Edit Court
function CourtModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData, 
  spaceTypes, 
  isEditing 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: any;
  setFormData: (data: any) => void;
  spaceTypes: SpaceType[];
  isEditing: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">
          {isEditing ? "Editar Pista" : "Crear Pista"}
        </h2>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full p-2 bg-gray-700 text-white rounded"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Precio por hora"
              value={formData.precio_hora}
              onChange={(e) => setFormData({ ...formData, precio_hora: e.target.value })}
              className="w-full p-2 bg-gray-700 text-white rounded"
              required
            />
            <input
              type="number"
              placeholder="Capacidad"
              value={formData.capacidad}
              onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
              className="w-full p-2 bg-gray-700 text-white rounded"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Precio por hora parcial (opcional)"
              value={formData.precio_hora_parcial}
              onChange={(e) => setFormData({ ...formData, precio_hora_parcial: e.target.value })}
              className="w-full p-2 bg-gray-700 text-white rounded"
            />
            <select
              value={formData.id_tipo_espacio}
              onChange={(e) => setFormData({ ...formData, id_tipo_espacio: e.target.value })}
              className="w-full p-2 bg-gray-700 text-white rounded"
              required
            >
              <option value="">Seleccionar tipo de espacio</option>
              {spaceTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.tipo}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-6">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
              Cancelar
            </button>
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              {isEditing ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal for Delete Confirmation
function DeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  court 
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  court: Court | null;
}) {
  if (!isOpen || !court) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Eliminar Pista</h2>
        <p className="text-gray-300 mb-6">
          ¿Estás seguro de que quieres eliminar la pista "{court.nombre}"? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
