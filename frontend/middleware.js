import { NextResponse } from "next/server";
import * as jose from "jose";

const ROLE_PERMISSIONS = {
  "/getAllUsers": ["administrador"],
  "/dashboard": ["cliente", "administrador"],
  "/reservations": ["cliente", "administrador"],
  "/reservations/create": ["cliente", "administrador"],
  "/reservations/my": ["cliente", "administrador"],
  "/courts": ["cliente", "administrador"],
  "/spaces": ["cliente", "administrador"],
  "/profile": ["cliente", "administrador"],
  "/penalties": ["cliente", "administrador"],
};

const PUBLIC_ROUTES = ["/", "/auth", "/login", "/register"];

function isPublicRoute(pathname) {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function getProtectedPath(pathname) {
  return Object.keys(ROLE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find((path) => pathname === path || pathname.startsWith(`${path}/`));
}

async function tryRefresh(request) {
  const backendUrl = process.env.INTERNAL_API_URL || "http://backend:8000";
  const cookieHeader = request.headers.get("cookie") || "";

  const refreshRes = await fetch(`${backendUrl}/users/refresh`, {
    method: "POST",
    headers: {
      Cookie: cookieHeader,
      "Content-Type": "application/json",
    },
  });

  if (!refreshRes.ok) return null;

  const data = await refreshRes.json();
  return data.newToken || null;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const protectedPath = getProtectedPath(pathname);
  const token = request.cookies.get("token")?.value;

  if (!token) {
    if (!isPublicRoute(pathname)) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    return NextResponse.next();
  }

  const secret = new TextEncoder().encode(process.env.SECRET_KEY || "tu_clave_secreta");

  try {
    const { payload } = await jose.jwtVerify(token, secret);

    if (protectedPath) {
      const role = (payload.rol || "").toLowerCase().trim();
      const allowed = ROLE_PERMISSIONS[protectedPath] || [];
      if (!allowed.includes(role)) {
        return NextResponse.redirect(new URL("/dashboard?error=403", request.url));
      }
    }

    return NextResponse.next();
  } catch {
    const newToken = await tryRefresh(request).catch(() => null);
    if (!newToken) {
      const response = NextResponse.redirect(new URL("/auth", request.url));
      response.cookies.delete("token");
      response.cookies.delete("refresh_token");
      return response;
    }

    const requestHeaders = new Headers(request.headers);
    const cookieHeader = request.headers.get("cookie") || "";
    const updatedCookies = cookieHeader.includes("token=")
      ? cookieHeader.replace(/token=[^;]+/, `token=${newToken}`)
      : `${cookieHeader}; token=${newToken}`;

    requestHeaders.set("cookie", updatedCookies);

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.cookies.set("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });
    return response;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/reservations/:path*",
    "/courts/:path*",
    "/spaces/:path*",
    "/profile/:path*",
    "/penalties/:path*",
    "/getAllUsers/:path*",
  ],
};
