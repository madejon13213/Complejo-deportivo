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
        window.location.assign("/login");
      }
    }

    throw new ApiError(message, response.status, payload);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
