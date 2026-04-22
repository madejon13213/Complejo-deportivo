"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";

interface AuthState {
  userId: string | null;
  role: string | null;
  isAdmin: boolean;
  isCliente: boolean;
  isClub: boolean;
  isAuthenticated: boolean;
  isReady: boolean;
}

interface LoginPayload {
  id?: number | string;
  sub?: number | string;
  id_rol?: number;
  rol?: string;
  role?: string;
}

interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const initialState: AuthState = {
  userId: null,
  role: null,
  isAdmin: false,
  isCliente: false,
  isClub: false,
  isAuthenticated: false,
  isReady: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function resolveRole(payload: LoginPayload): string {
  if (payload.rol) return payload.rol.toLowerCase().trim();
  if (payload.role) return payload.role.toLowerCase().trim();
  if (payload.id_rol === 1) return "administrador";
  if (payload.id_rol === 3) return "club";
  return "cliente";
}

function parseRole(payload: LoginPayload): AuthState {
  const role = resolveRole(payload);
  return {
    userId: String(payload.id ?? payload.sub ?? ""),
    role,
    isAdmin: role === "administrador" || role === "admin",
    isCliente: role === "cliente",
    isClub: role === "club",
    isAuthenticated: true,
    isReady: true,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const workerRef = useRef<Worker | null>(null);
  const [auth, setAuth] = useState<AuthState>(initialState);

  const checkAuth = useCallback(async () => {
    try {
      const user = await apiFetch<LoginPayload>("/users/me", { method: "GET", cache: "no-store" });
      setAuth(parseRole(user));
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError?.status === 401) {
        try {
          const refreshed = await fetch("/api/users/refresh", { method: "POST", credentials: "include" });
          if (refreshed.ok) {
            const user = await apiFetch<LoginPayload>("/users/me", { method: "GET", cache: "no-store" });
            setAuth(parseRole(user));
            return;
          }
        } catch {
          // ignore refresh failure
        }
      }
      setAuth({ ...initialState, isReady: true });
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      if (workerRef.current) {
        workerRef.current.postMessage("stop");
        workerRef.current.terminate();
        workerRef.current = null;
      }
      return;
    }

    if (!workerRef.current) {
      workerRef.current = new Worker("/auth-worker.js");
      workerRef.current.onmessage = (event: MessageEvent<string>) => {
        if (event.data === "tick") {
          void checkAuth();
        }
      };
    }
    workerRef.current.postMessage("start");

    return () => {
      if (workerRef.current) workerRef.current.postMessage("stop");
    };
  }, [auth.isAuthenticated, checkAuth]);

  const login = useCallback((payload: LoginPayload) => {
    setAuth(parseRole(payload));
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/users/logout", { method: "POST", credentials: "include" });
    } finally {
      setAuth({ ...initialState, isReady: true });
      router.push("/login");
    }
  }, [router]);

  const value = useMemo(() => ({ ...auth, login, logout, checkAuth }), [auth, login, logout, checkAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  return context;
}
