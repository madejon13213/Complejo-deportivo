"use client";

import { useState } from "react";
import PenaltiesTable from "@/app/components/Tables/PenaltiesTable";
import Spinner from "@/app/components/UI/Spinner";
import Toast from "@/app/components/UI/Toast";
import Pagination from "@/app/components/UI/Pagination";
import { useAuth } from "@/context/AuthContext";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { getPenaltiesByUser } from "@/lib/services/penalties";
import { PenaltySearchResponse } from "@/lib/types";

const LIMIT = 10;

export default function PenaltiesPage() {
  const { userId, isReady } = useAuth();
  const [page, setPage] = useState(1);
  const numericUserId = userId ? Number(userId) : null;

  const penaltiesQuery = useApiQuery<PenaltySearchResponse>(
    () => getPenaltiesByUser(numericUserId || 0, page, LIMIT),
    [numericUserId, page],
    { enabled: isReady && Boolean(numericUserId) }
  );

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-8">
      <h1 className="text-4xl text-white">Mis penalizaciones</h1>
      {penaltiesQuery.loading && <Spinner />}
      {penaltiesQuery.error && <Toast kind="error" message={penaltiesQuery.error} />}
      
      <div className="space-y-4">
        <PenaltiesTable rows={penaltiesQuery.data?.items || []} />
        <Pagination 
          currentPage={page} 
          totalPages={penaltiesQuery.data?.total_pages || 0} 
          onPageChange={setPage} 
        />
      </div>
    </div>
  );
}
