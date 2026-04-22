"use client";

import { useCallback, useEffect, useState } from "react";

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface QueryOptions {
  enabled?: boolean;
}

export function useApiQuery<T>(queryFn: () => Promise<T>, deps: unknown[] = [], options: QueryOptions = {}): QueryState<T> {
  const enabled = options.enabled ?? true;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);
    try {
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la informacion");
    } finally {
      setLoading(false);
    }
  }, [enabled, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void run();
  }, [enabled, run]);

  return { data, loading, error, refetch: run };
}
