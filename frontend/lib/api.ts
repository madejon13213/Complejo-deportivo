import { toast } from "sonner";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function parseErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "Error de servidor";

  const candidate = payload as { detail?: unknown; error?: unknown; message?: unknown };
  if (typeof candidate.detail === "string") return candidate.detail;
  if (typeof candidate.error === "string") return candidate.error;
  if (typeof candidate.message === "string") return candidate.message;
  return "Error de servidor";
}

function isAuthRoute(pathname: string): boolean {
  return pathname === "/login" || pathname === "/auth" || pathname === "/register";
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        payload = undefined;
      }

      const message = parseErrorMessage(payload);

      if (response.status === 401 && typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (!isAuthRoute(currentPath)) {
          toast.error("Tu sesión ha caducado. Por favor, inicia sesión de nuevo.");
          window.location.assign("/login");
        }
      } else if (response.status === 409 && typeof window !== "undefined") {
        toast.error(message, {
          duration: 6000,
          action: {
            label: "Refrescar",
            onClick: () => window.location.reload()
          }
        });
      } else if (typeof window !== "undefined") {
        toast.error(message);
      }

      throw new ApiError(message, response.status, payload);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Fallback for network errors (e.g. server down, offline)
    if (typeof window !== "undefined") {
      toast.error("Error de conexión. Verifica tu acceso a internet e inténtalo de nuevo.");
    }
    throw new ApiError("Error de conexión.", 0);
  }
}
