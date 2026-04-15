import { NextResponse } from "next/server";
import * as jose from "jose";


export async function middleware(request) {
  const token = request.cookies.get("token")?.value;
  let response = NextResponse.next();

  if (!token) return response;

  try {
    const secret = new TextEncoder().encode(process.env.SECRET_KEY || "tu_clave_secreta_super_segura");
    const { payload } = await jose.jwtVerify(token, secret);
    
    const ahora = Math.floor(Date.now() / 1000);
    const exp = payload.exp || 0;
    const tiempoRestante = exp - ahora;

    if (tiempoRestante > 0 && tiempoRestante < 180) {
      console.log(`🔄 [MIDDLEWARE] Refrescando sesión. Faltan: ${tiempoRestante}s`);
      
      const backendUrl = process.env.INTERNAL_API_URL || "http://backend:8000";
      
      try {
        const refreshRes = await fetch(`${backendUrl}/users/refresh`, {
          method: "POST",
          headers: { 
            "Cookie": request.headers.get("cookie") || "",
            "Content-Type": "application/json"
          },
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          
          if (data.newToken) {

            const requestHeaders = new Headers(request.headers);
            const currentCookies = request.headers.get("cookie") || "";
            const updatedCookies = currentCookies.replace(/token=[^;]+/, `token=${data.newToken}`);
            requestHeaders.set("cookie", updatedCookies);

            response = NextResponse.next({
              request: { headers: requestHeaders },
            });

            response.cookies.set("token", data.newToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 15 * 60,
            });

            console.log("✅ [MIDDLEWARE] Access token actualizado. Refresh token permanece estático.");
          }
        } else if (refreshRes.status === 401) {
          console.warn("⚠️ [MIDDLEWARE] Refresh denegado. Limpiando sesión.");
          response.cookies.delete("token");
          response.cookies.delete("refresh_token");
        }
      } catch (fetchError) {
        console.error("❌ [MIDDLEWARE] Error de red:", fetchError.message);
      }
    }
  } catch (err) {
    // 6. RESCATE REACTIVO: Si el token ya expiró, intentamos salvar la sesión
    // antes de que la petición llegue al backend y falle.
    const hasRefreshToken = request.cookies.get("refresh_token")?.value;
    
    if (hasRefreshToken) {
      console.log("🩹 [MIDDLEWARE] Token expirado detectado. Intentando rescate reactivo...");
      const backendUrl = process.env.INTERNAL_API_URL || "http://backend:8000";
      
      try {
        const refreshRes = await fetch(`${backendUrl}/users/refresh`, {
          method: "POST",
          headers: { 
            "Cookie": request.headers.get("cookie") || "",
            "Content-Type": "application/json"
          },
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          if (data.newToken) {
            const requestHeaders = new Headers(request.headers);
            const currentCookies = request.headers.get("cookie") || "";
            const updatedCookies = currentCookies.replace(/token=[^;]+/, `token=${data.newToken}`);
            requestHeaders.set("cookie", updatedCookies);

            response = NextResponse.next({
              request: { headers: requestHeaders },
            });

            response = NextResponse.next({
              request: { headers: requestHeaders },
            });

            response.cookies.set("token", data.newToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 15 * 60,
            });

            console.log("✅ [MIDDLEWARE] Sesión rescatada reactivamente (Solo access token).");
          }

        }
      } catch (rescueError) {
        console.error("❌ [MIDDLEWARE] El rescate falló:", rescueError.message);
      }
    }
  }


  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/api/:path*"],
};