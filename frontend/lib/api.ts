export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = "Error de servidor";
    try {
      const payload = await response.json();
      message = payload.detail || payload.error || message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
