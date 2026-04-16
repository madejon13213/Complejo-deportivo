import { NextResponse } from "next/server";
import * as jose from "jose";

const ROLE_PERMISSIONS = {
  "/getAllUsers": ["administrador"],
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next();

  const protectedPath = Object.keys(ROLE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find(
      (path) => pathname === path || pathname.startsWith(path + "/")
    );

  const token = request.cookies.get("token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

 
  if (!token) {
    if (protectedPath) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    return response;
  }

  try {
  
    const secret = new TextEncoder().encode(
      process.env.SECRET_KEY || "tu_clave_secreta"
    );

    const { payload } = await jose.jwtVerify(token, secret);

    const ahora = Math.floor(Date.now() / 1000);
    const exp = payload.exp || 0;
    const tiempoRestante = exp - ahora;

  
    if (tiempoRestante > 0 && tiempoRestante < 180) {
      console.log("🔄 Renovando token...");

      const backendUrl =
        process.env.INTERNAL_API_URL || "http://backend:8000";

      try {
        const cookieHeader = request.headers.get("cookie") || "";

        const refreshRes = await fetch(`${backendUrl}/users/refresh`, {
          method: "POST",
          headers: {
            Cookie: cookieHeader,
            "Content-Type": "application/json",
          },
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();

          if (data.newToken) {
            // 🔁 Actualizar request
            const requestHeaders = new Headers(request.headers);
            const updatedCookies = cookieHeader.replace(
              /token=[^;]+/,
              `token=${data.newToken}`
            );

            requestHeaders.set("cookie", updatedCookies);

            response = NextResponse.next({
              request: { headers: requestHeaders },
            });

            // 🍪 Actualizar cookie
            response.cookies.set("token", data.newToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 15 * 60,
            });

            console.log("✅ Token renovado correctamente");
          }
        } else if (refreshRes.status === 401) {
          console.warn("⚠️ Refresh inválido");

          response.cookies.delete("token");
          response.cookies.delete("refresh_token");

          return NextResponse.redirect(new URL("/auth", request.url));
        }
      } catch (err) {
        console.error("❌ Error en refresh:", err.message);
      }
    }

    // 🔐 CONTROL DE ROLES
    if (protectedPath) {
      const userRole = (payload.rol || "")
        .toLowerCase()
        .trim();

      const allowedRoles = ROLE_PERMISSIONS[protectedPath];

      if (!allowedRoles.includes(userRole)) {
        console.warn("⛔ Acceso denegado:", userRole);
        return NextResponse.redirect(new URL("/auth", request.url));
      }
    }

    return response;
  } catch (error) {
    console.error("❌ Token inválido o expirado:", error.message);

    if (refreshToken) {
      try {
        const backendUrl =
          process.env.INTERNAL_API_URL || "http://backend:8000";

        const cookieHeader = request.headers.get("cookie") || "";

        const refreshRes = await fetch(`${backendUrl}/users/refresh`, {
          method: "POST",
          headers: {
            Cookie: cookieHeader,
            "Content-Type": "application/json",
          },
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();

          if (data.newToken) {
            const requestHeaders = new Headers(request.headers);
            const updatedCookies = cookieHeader.replace(
              /token=[^;]+/,
              `token=${data.newToken}`
            );

            requestHeaders.set("cookie", updatedCookies);

            const newResponse = NextResponse.next({
              request: { headers: requestHeaders },
            });

            newResponse.cookies.set("token", data.newToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 15 * 60,
            });

            console.log("🩹 Sesión recuperada");

            return newResponse;
          }
        }
      } catch (err) {
        console.error("❌ Falló el rescate:", err.message);
      }
    }

    const errorResponse = NextResponse.redirect(
      new URL("/auth", request.url)
    );
    errorResponse.cookies.delete("token");
    errorResponse.cookies.delete("refresh_token");

    return errorResponse;
  }
}

export const config = {
  matcher: [
    "/getAllUsers/:path*",

  ],
};