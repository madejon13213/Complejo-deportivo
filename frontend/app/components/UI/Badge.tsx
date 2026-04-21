import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "error" | "info";
}

const tones = {
  neutral: "bg-acero text-carbon",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
};

export default function Badge({ children, tone = "neutral" }: BadgeProps) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
