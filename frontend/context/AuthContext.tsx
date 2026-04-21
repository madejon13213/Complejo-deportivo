"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface AuthState {
  userId: string | null;
  role: string | null;
  isAdmin: boolean;
  isCliente: boolean;
  isAuthenticated: boolean;
  isReady: boolean;
}

interface LoginPayload {
  id?: number | string;
  sub?: number | string;
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
  isAuthenticated: false,
  isReady: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseRole(payload: LoginPayload): AuthState {
  const role = (payload.rol || payload.role || "").toLowerCase().trim();
  return {
    userId: String(payload.id ?? payload.sub ?? ""),
    role,
    isAdmin: role === "administrador" || role === "admin",
    isCliente: role === "cliente",
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
    } catch {
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
      setAuth({ ...initialState, isReady: true });
    }
  }, []);

  useEffect(() => {
    checkAuth();
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
        if (event.data === "tick") checkAuth();
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
      router.push("/auth");
    }
  }, [router]);

  const value = useMemo(
    () => ({ ...auth, login, logout, checkAuth }),
    [auth, login, logout, checkAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  return context;
}
