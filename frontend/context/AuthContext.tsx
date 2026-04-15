"use client";

import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  useEffect, 
  useRef, 
  useMemo 
} from 'react';
import { useRouter } from 'next/navigation';

// --- DEFINICIÓN DE TIPOS ---
interface AuthState {
  userId: string | null;
  role: string | null;
  isAdmin: boolean;
  isClub: boolean;
  isCliente: boolean;
  isAuthenticated: boolean;
  isReady: boolean;
}

interface AuthContextType extends AuthState {
  login: (userData: any) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({
    userId: null,
    role: null,
    isAdmin: false,
    isClub: false,
    isCliente: false,
    isAuthenticated: false,
    isReady: false,
  });

  const workerRef = useRef<Worker | null>(null);

  // --- PROCESAMIENTO DE ROLES ---
  const processUserRole = useCallback((user: any) => {
    const rawRole = (user.rol ?? user.role ?? "").toLowerCase().trim();
    return {
      userId: String(user.id ?? user.sub),
      role: rawRole,
      isAdmin: rawRole === "administrador" || rawRole === "admin",
      isClub: rawRole === "club",
      isCliente: rawRole === "cliente",
      isAuthenticated: true,
      isReady: true,
    };
  }, []);

  // --- VERIFICACIÓN DE SESIÓN (Dispara el Middleware) ---
  const checkAuth = useCallback(async () => {
    try {
      // Importante: Usamos la ruta /api/users/me para que pase por el Middleware de Next.js
      const res = await fetch("/api/users/me", {
        method: "GET",
        credentials: "include",
        cache: 'no-store'
      });

      if (res.ok) {
        const user = await res.json();
        setAuth(processUserRole(user));
      } else {
        // Si falla, intentamos un refresh explícito
        const refreshRes = await fetch("/api/users/refresh", { 
          method: "POST", 
          credentials: "include" 
        });

        if (refreshRes.ok) {
          const retry = await fetch("/api/users/me", { method: "GET", credentials: "include" });
          if (retry.ok) {
            setAuth(processUserRole(await retry.json()));
            return;
          }
        }
        throw new Error("Sesión inválida");
      }
    } catch (error) {
      setAuth({ 
        userId: null, role: null, isAdmin: false, isClub: false, 
        isCliente: false, isAuthenticated: false, isReady: true 
      });
    }
  }, [processUserRole]);

  // --- GESTIÓN DEL WEB WORKER (Segundo Plano) ---
  useEffect(() => {
    if (auth.isAuthenticated) {
      if (!workerRef.current) {
        workerRef.current = new Worker('/auth-worker.js');

        workerRef.current.onmessage = (e) => {
          if (e.data === "tick") {
            console.log("💓 [WORKER] Latido detectado. Sincronizando sesión...");
            checkAuth(); 
          }
        };
      }
      workerRef.current.postMessage("start");
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage("stop");
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [auth.isAuthenticated, checkAuth]);

  // Verificación inicial al cargar la página
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // --- ACCIONES DE LOGIN / LOGOUT ---
  const login = useCallback((userData: any) => {
    setAuth(processUserRole(userData));
  }, [processUserRole]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/users/logout", { method: "POST", credentials: "include" });
    } finally {
      if (workerRef.current) workerRef.current.postMessage("stop");
      setAuth({ 
        userId: null, role: null, isAdmin: false, isClub: false, 
        isCliente: false, isAuthenticated: false, isReady: true 
      });
      router.push("/auth");
    }
  }, [router]);

  const value = useMemo(() => ({
    ...auth, login, logout, checkAuth
  }), [auth, login, logout, checkAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};