"use client";

import PenaltiesTable from "@/app/components/Tables/PenaltiesTable";
import Spinner from "@/app/components/UI/Spinner";
import Toast from "@/app/components/UI/Toast";
import { useAuth } from "@/context/AuthContext";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { getPenaltiesByUser } from "@/lib/services/penalties";
import { Penalty } from "@/lib/types";

export default function PenaltiesPage() {
  const { userId, isReady } = useAuth();
  const numericUserId = userId ? Number(userId) : null;

  const penaltiesQuery = useApiQuery<Penalty[]>(
    () => getPenaltiesByUser(numericUserId || 0),
    [numericUserId],
    { enabled: isReady && Boolean(numericUserId) }
  );

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-8">
      <h1 className="text-3xl">Mis penalizaciones</h1>
      {penaltiesQuery.loading && <Spinner />}
      {penaltiesQuery.error && <Toast kind="error" message={penaltiesQuery.error} />}
      <PenaltiesTable rows={penaltiesQuery.data || []} />
    </div>
  );
}
