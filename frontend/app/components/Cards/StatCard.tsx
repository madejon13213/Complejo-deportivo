import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-acero bg-white p-5 shadow-sm">
      <div className="mb-3 inline-flex rounded-lg bg-nieve p-2 text-azul-pro">{icon}</div>
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl">{value}</h3>
    </article>
  );
}
