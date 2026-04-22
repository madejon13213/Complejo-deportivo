"use client";

import SpaceCard from "@/app/components/Cards/SpaceCard";
import Spinner from "@/app/components/UI/Spinner";
import Toast from "@/app/components/UI/Toast";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { getSpaces } from "@/lib/services/spaces";
import { SpaceType } from "@/lib/types";

export default function SpacesPage() {
  const spacesQuery = useApiQuery<SpaceType[]>(() => getSpaces(), []);

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-8">
      <h1 className="text-3xl">Tipos de espacios</h1>
      {spacesQuery.loading && <Spinner />}
      {spacesQuery.error && <Toast kind="error" message={spacesQuery.error} />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(spacesQuery.data || []).map((space) => (
          <SpaceCard key={space.id} space={space} />
        ))}
      </div>
    </div>
  );
}
