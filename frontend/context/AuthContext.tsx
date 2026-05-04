"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch, ApiError } from "@/lib/api";
import { getMyNotifications, markNotificationRead } from "@/lib/services/notifications";
import { Notification } from "@/lib/types";

const REFRESH_INTERVAL_MS = 13 * 60 * 1000;
const NOTIFICATIONS_POLLING_MS = 30 * 1000;
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos

interface AuthState {
  userId: string | null;
  role: string | null;
  isAdmin: boolean;
  isCliente: boolean;
  isClub: boolean;
  isAuthenticated: boolean;
  isReady: boolean;
  expiresAt: number | null;
}

interface LoginPayload {
  id?: number | string;
  sub?: number | string;
  rol?: string;
  role?: string;
  expires_at?: number;
}

interface AuthContextType extends AuthState {
  notifications: Notification[];
  unreadNotificationsCount: number;
  login: (payload: LoginPayload) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: number) => Promise<void>;
}

const initialState: AuthState = {
  userId: null,
  role: null,
  isAdmin: false,
  isCliente: false,
  isClub: false,
  isAuthenticated: false,
  isReady: false,
  expiresAt: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeRole(roleValue?: string | null): string {
  const value = (roleValue || "").trim().toUpperCase();
  if (value === "ADMINISTRADOR") return "ADMIN";
  if (value === "ADMIN") return "ADMIN";
  if (value === "CLUB") return "CLUB";
  return "CLIENTE";
}

function resolveRole(payload: LoginPayload): string {
  if (payload.rol) return normalizeRole(payload.rol);
  if (payload.role) return normalizeRole(payload.role);
  return "CLIENTE";
}

function parseRole(payload: LoginPayload): AuthState {
  const role = resolveRole(payload);
  return {
    userId: String(payload.id ?? payload.sub ?? ""),
    role,
    isAdmin: role === "ADMIN",
    isCliente: role === "CLIENTE",
    isClub: role === "CLUB",
    isAuthenticated: true,
    isReady: true,
    expiresAt: payload.expires_at ?? (payload as any).exp ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshInFlightRef = useRef(false);
  const isUnmountedRef = useRef(false);
  const [auth, setAuth] = useState<AuthState>(initialState);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const stopRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const stopNotificationsTimer = useCallback(() => {
    if (notificationsTimerRef.current) {
      clearInterval(notificationsTimerRef.current);
      notificationsTimerRef.current = null;
    }
  }, []);

  const stopInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const clearLocalAuthState = useCallback(() => {
    setAuth({ ...initialState, isReady: true });
    setNotifications([]);
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!auth.isAuthenticated) {
      setNotifications([]);
      return;
    }

    try {
      const list = await getMyNotifications(25);
      setNotifications(list);
    } catch {
      setNotifications([]);
    }
  }, [auth.isAuthenticated]);

  const markNotificationAsRead = useCallback(async (notificationId: number) => {
    await markNotificationRead(notificationId);
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (isUnmountedRef.current) {
      return false;
    }

    if (refreshInFlightRef.current) {
      return true;
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

      const refreshData = await refreshResponse.json();
      const user = await apiFetch<LoginPayload>("/users/me", { method: "GET", cache: "no-store" });
      
      // Combinamos la info de /me con el expires_at del refresh
      setAuth(parseRole({ ...user, expires_at: refreshData.expires_at }));
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlightRef.current = false;
    }
  }, []);

  const performLogout = useCallback(async () => {
    stopRefreshTimer();
    stopNotificationsTimer();
    stopInactivityTimer();
    try {
      await fetch("/api/users/logout", { method: "POST", credentials: "include" });
    } finally {
      clearLocalAuthState();
      router.push("/login");
    }
  }, [clearLocalAuthState, router, stopRefreshTimer, stopNotificationsTimer]);

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
    if (auth.isAuthenticated) {
      void refreshNotifications();
    }
  }, [auth.isAuthenticated, refreshNotifications]);

  // Lógica de autorefresco basada en expiración
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.expiresAt) {
      stopRefreshTimer();
      return;
    }

    const now = Date.now() / 1000;
    const timeLeft = auth.expiresAt - now;
    
    // Refrescar 2 minutos antes de que expire (120 segundos)
    const buffer = 120;
    const delay = Math.max(0, (timeLeft - buffer) * 1000);

    stopRefreshTimer();
    refreshTimerRef.current = setTimeout(async () => {
      const ok = await refreshSession();
      if (!ok) {
        await performLogout();
      }
    }, delay);

    return () => stopRefreshTimer();
  }, [auth.isAuthenticated, auth.expiresAt, refreshSession, performLogout, stopRefreshTimer]);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      stopNotificationsTimer();
      return;
    }

    stopNotificationsTimer();
    notificationsTimerRef.current = setInterval(() => {
      void refreshNotifications();
    }, NOTIFICATIONS_POLLING_MS);

    return () => {
      stopNotificationsTimer();
    };
  }, [auth.isAuthenticated, refreshNotifications, stopNotificationsTimer]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      stopRefreshTimer();
      stopNotificationsTimer();
      setAuth((prev) => ({ ...prev, isAuthenticated: false, isReady: true }));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [stopRefreshTimer, stopNotificationsTimer]);

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      stopRefreshTimer();
      stopNotificationsTimer();
      stopInactivityTimer();
    };
  }, [stopRefreshTimer, stopNotificationsTimer, stopInactivityTimer]);

  // Lógica de inactividad (Auto-logout)
  useEffect(() => {
    if (!auth.isAuthenticated) {
      stopInactivityTimer();
      return;
    }

    const resetTimer = () => {
      stopInactivityTimer();
      inactivityTimerRef.current = setTimeout(() => {
        void performLogout();
      }, INACTIVITY_TIMEOUT_MS);
    };

    // Eventos que cuentan como "actividad"
    const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    
    // Configurar listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Iniciar el primer temporizador
    resetTimer();

    return () => {
      stopInactivityTimer();
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [auth.isAuthenticated, performLogout, stopInactivityTimer]);

  const login = useCallback((payload: LoginPayload) => {
    setAuth(parseRole(payload));
  }, []);

  const logout = useCallback(async () => {
    await performLogout();
  }, [performLogout]);

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((notification) => !notification.leida).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      ...auth,
      notifications,
      unreadNotificationsCount,
      login,
      logout,
      checkAuth,
      refreshNotifications,
      markNotificationAsRead,
    }),
    [auth, notifications, unreadNotificationsCount, login, logout, checkAuth, refreshNotifications, markNotificationAsRead]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  return context;
}