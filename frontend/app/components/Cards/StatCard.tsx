import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-white/15 bg-black/35 p-5 text-white backdrop-blur-sm">
      <div className="mb-3 inline-flex rounded-lg bg-white/10 p-2 text-[#88a0ff]">{icon}</div>
      <p className="text-sm text-gray-300">{title}</p>
      <h3 className="text-2xl text-white">{value}</h3>
    </article>
  );
}
