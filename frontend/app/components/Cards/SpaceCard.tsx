import Link from "next/link";
import { Building2, Dumbbell, Waves } from "lucide-react";

import Button from "@/app/components/UI/Button";
import { SpaceType } from "@/lib/types";

interface SpaceCardProps {
  space: SpaceType;
}

function iconFor(name: string) {
  const value = name.toLowerCase();
  if (value.includes("pisc")) return <Waves size={18} />;
  if (value.includes("gim")) return <Dumbbell size={18} />;
  return <Building2 size={18} />;
}

export default function SpaceCard({ space }: SpaceCardProps) {
  return (
    <article className="rounded-2xl border border-white/15 bg-black/35 p-5 text-white backdrop-blur-sm">
      <div className="mb-3 inline-flex rounded-lg bg-white/10 p-2 text-[#88a0ff]">{iconFor(space.tipo)}</div>
      <h3 className="text-xl text-white">{space.tipo}</h3>
      <p className="mb-4 mt-2 text-sm text-gray-200">
        {space.permite_reserva_parcial ? "Permite reserva parcial" : "Solo reserva completa"}
      </p>
      <Link href={`/courts?spaceType=${space.id}`}>
        <Button className="w-full" variant="secondary">
          Ver pistas
        </Button>
      </Link>
    </article>
  );
}
