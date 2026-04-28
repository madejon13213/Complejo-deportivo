"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch, ApiError } from "@/lib/api";
import { getMyNotifications, markNotificationRead } from "@/lib/services/notifications";
import { Notification } from "@/lib/types";

const REFRESH_INTERVAL_MS = 13 * 60 * 1000;
const NOTIFICATIONS_POLLING_MS = 30 * 1000;

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
  rol?: string;
  role?: string;
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
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshInFlightRef = useRef(false);
  const isUnmountedRef = useRef(false);
  const [auth, setAuth] = useState<AuthState>(initialState);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const stopRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const stopNotificationsTimer = useCallback(() => {
    if (notificationsTimerRef.current) {
      clearInterval(notificationsTimerRef.current);
      notificationsTimerRef.current = null;
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
      prev.map((notification) =>
        notification.id === notificationId ? { ...notification, leida: true } : notification
      )
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
    stopNotificationsTimer();
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
    };
  }, [stopRefreshTimer, stopNotificationsTimer]);

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