"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";

const REFRESH_INTERVAL_MS = 13 * 60 * 1000;

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
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshInFlightRef = useRef(false);
  const isUnmountedRef = useRef(false);
  const [auth, setAuth] = useState<AuthState>(initialState);

  const stopRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const clearLocalAuthState = useCallback(() => {
    setAuth({ ...initialState, isReady: true });
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (refreshInFlightRef.current || isUnmountedRef.current) {
      return false;
    }

    refreshInFlightRef.current = true;

    try {
      const refreshResponse = await fetch("/api/users/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!refreshResponse.ok) {
        return false;
      }

      const user = await apiFetch<LoginPayload>("/users/me", { method: "GET", cache: "no-store" });
      setAuth(parseRole(user));
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlightRef.current = false;
    }
  }, []);

  const performLogout = useCallback(async () => {
    stopRefreshTimer();
    try {
      await fetch("/api/users/logout", { method: "POST", credentials: "include" });
    } finally {
      clearLocalAuthState();
      router.push("/login");
    }
  }, [clearLocalAuthState, router, stopRefreshTimer]);

  const checkAuth = useCallback(async () => {
    try {
      const user = await apiFetch<LoginPayload>("/users/me", { method: "GET", cache: "no-store" });
      setAuth(parseRole(user));
      return;
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError?.status === 401) {
        const refreshed = await refreshSession();
        if (refreshed) {
          return;
        }
      }
      clearLocalAuthState();
    }
  }, [clearLocalAuthState, refreshSession]);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      stopRefreshTimer();
      return;
    }

    stopRefreshTimer();
    refreshTimerRef.current = setInterval(async () => {
      const ok = await refreshSession();
      if (!ok) {
        await performLogout();
      }
    }, REFRESH_INTERVAL_MS);

    return () => {
      stopRefreshTimer();
    };
  }, [auth.isAuthenticated, performLogout, refreshSession, stopRefreshTimer]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      stopRefreshTimer();
      // Solo limpiamos estado local en memoria; no invalidamos refresh_token al cerrar pestaña.
      setAuth((prev) => ({ ...prev, isAuthenticated: false, isReady: true }));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [stopRefreshTimer]);

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      stopRefreshTimer();
    };
  }, [stopRefreshTimer]);

  const login = useCallback((payload: LoginPayload) => {
    setAuth(parseRole(payload));
  }, []);

  const logout = useCallback(async () => {
    await performLogout();
  }, [performLogout]);

  const value = useMemo(() => ({ ...auth, login, logout, checkAuth }), [auth, login, logout, checkAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  return context;
}
