"use client";

import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

interface ToastProps {
  kind?: "success" | "error" | "warning" | "info";
  message: string;
}

const iconMap = {
  success: <CheckCircle2 size={16} />,
  error: <XCircle size={16} />,
  warning: <AlertCircle size={16} />,
  info: <Info size={16} />,
};

const styleMap = {
  success: "bg-green-50 border-green-200 text-green-700",
  error: "bg-red-50 border-red-200 text-red-700",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
  info: "bg-blue-50 border-blue-200 text-blue-700",
};

export default function Toast({ kind = "info", message }: ToastProps) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${styleMap[kind]}`}>
      {iconMap[kind]}
      <span>{message}</span>
    </div>
  );
}
