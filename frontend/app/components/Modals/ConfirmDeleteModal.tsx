"use client";

import Button from "@/app/components/UI/Button";

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
}

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  message = "¿Seguro que deseas eliminar este elemento?",
}: ConfirmDeleteModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 shadow-2xl text-white">
        <h3 className="text-xl font-semibold">Confirmar eliminación</h3>
        <p className="mt-3 text-sm text-gray-400">{message}</p>
        
        <div className="mt-8 flex justify-end gap-3">
          <Button 
            variant="secondary" 
            onClick={onClose}
            className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
          >
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}
