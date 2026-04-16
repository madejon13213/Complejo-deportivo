import os
import jwt
import redis
import bcrypt
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, Response, status, Request
from fastapi.security import APIKeyCookie
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

# Configuración de Redis
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "redis"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=0,
    decode_responses=True
)

class AuthManager:
    SECRET_KEY = os.getenv("SECRET_KEY", "tu_clave_secreta_super_segura")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 15
    REFRESH_TOKEN_EXPIRE_DAYS = 30
    
    cookie_scheme = APIKeyCookie(name="token", auto_error=False)

    @staticmethod
    def create_access_token(data: dict) -> str:
        to_encode = data.copy()
        if "id" in to_encode:
            to_encode["sub"] = str(to_encode["id"])
        
        expire = datetime.now(timezone.utc) + timedelta(minutes=AuthManager.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({
            "exp": int(expire.timestamp()), 
            "type": "access"
        })
        return jwt.encode(to_encode, AuthManager.SECRET_KEY, algorithm=AuthManager.ALGORITHM)

    @staticmethod
    def create_refresh_token(user_id: int) -> str:
        expire = datetime.now(timezone.utc) + timedelta(days=AuthManager.REFRESH_TOKEN_EXPIRE_DAYS)
        payload = {
            "sub": str(user_id),
            "type": "refresh",
            "exp": int(expire.timestamp())
        }
        token = jwt.encode(payload, AuthManager.SECRET_KEY, algorithm=AuthManager.ALGORITHM)
        
        redis_client.setex(
            f"refresh:{token}",
            timedelta(days=AuthManager.REFRESH_TOKEN_EXPIRE_DAYS),
            str(user_id)
        )
        return token

    @staticmethod
    def _set_auth_cookies(response: Response, access_token: str, refresh_token: str):
        is_production = os.getenv("ENVIRONMENT", "development") != "development"

        common_settings = {
            "httponly": True,
            "secure": is_production,   
            "samesite": "lax",
            "path": "/",
        }

        response.set_cookie(
            key="token",
            value=access_token,
            max_age=AuthManager.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            **common_settings
        )
        
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            max_age=AuthManager.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
            **common_settings
        )

    @staticmethod
    def login(email: str, input_pass: str, db: Session, response: Response) -> Dict[str, Any]:
        from app.tables.tables import Usuario 
        
        user = db.query(Usuario).filter(Usuario.email == email).first()
        
        if not user or not bcrypt.checkpw(input_pass.encode("utf-8"), user.contraseña.encode("utf-8")):
            return {"error": "Email o contraseña incorrectos"}

        rol_nombre = user.rol_rel.rol.lower() if (hasattr(user, 'rol_rel') and user.rol_rel) else "cliente"

        access_token = AuthManager.create_access_token({
            "id": user.id, "name": user.nombre, "rol": rol_nombre
        })
        refresh_token = AuthManager.create_refresh_token(user.id)

        AuthManager._set_auth_cookies(response, access_token, refresh_token)

        return {
            "success": True, 
            "user": {"id": user.id, "name": user.nombre, "rol": rol_nombre}
        }

    @staticmethod
    def refresh_access_token(request: Request, response: Response, db: Session) -> dict:
        refresh_token = request.cookies.get("refresh_token")
        
        if not refresh_token:
            raise HTTPException(status_code=401, detail="No hay token de refresco")

        stored_user_id = redis_client.get(f"refresh:{refresh_token}")
        if not stored_user_id:
            raise HTTPException(status_code=401, detail="Token expirado en servidor")

        from app.tables.tables import Usuario
        user = db.query(Usuario).filter(Usuario.id == int(stored_user_id)).first()
        
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")

        rol_nombre = user.rol_rel.rol.lower() if (hasattr(user, 'rol_rel') and user.rol_rel) else "cliente"

        # Solo creamos un nuevo Access Token
        new_access = AuthManager.create_access_token({"id": user.id, "name": user.nombre, "rol": rol_nombre})
        
        # Seteamos solo la cookie del access token
        is_production = os.getenv("ENVIRONMENT", "development") != "development"
        response.set_cookie(
            key="token",
            value=new_access,
            max_age=AuthManager.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            httponly=True,
            secure=is_production,
            samesite="lax",
            path="/",
        )

        return {"status": "Access token actualizado"}


    @staticmethod
    def logout(response: Response, request: Request):
        token = request.cookies.get("token")
        if token:
            AuthManager.revoke_token(token)
            
        refresh = request.cookies.get("refresh_token")
        if refresh:
            redis_client.delete(f"refresh:{refresh}")

        response.delete_cookie("token", path="/")
        response.delete_cookie("refresh_token", path="/")
        return {"message": "Sesión cerrada"}

    @staticmethod
    def revoke_token(token: str):
        try:
            payload = jwt.decode(token, AuthManager.SECRET_KEY, algorithms=[AuthManager.ALGORITHM], options={"verify_exp": False})
            exp = payload.get("exp")
            if exp:
                ttl = int(exp - datetime.now(timezone.utc).timestamp())
                if ttl > 0:
                    redis_client.setex(f"blacklist:{token}", ttl, "true")
        except:
            pass

    @staticmethod
    async def get_current_user(request: Request):
        token = request.cookies.get("token")

        if not token:
            raise HTTPException(status_code=401, detail="No hay cookie de sesión")

        if redis_client.exists(f"blacklist:{token}"):
            raise HTTPException(status_code=401, detail="Token revocado")
            
        try:
            payload = jwt.decode(token, AuthManager.SECRET_KEY, algorithms=[AuthManager.ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expirado")
        except jwt.PyJWTError:
            raise HTTPException(status_code=401, detail="Token inválido")

    @staticmethod
    async def get_current_admin(current_user: dict = Depends(get_current_user)):
        """Verifica que el usuario esté logueado y sea ADMIN"""
        rol = current_user.get("rol", "").lower()
        if rol != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Acceso denegado: Se requieren permisos de Administrador"
            )
        return current_user

    @staticmethod
    async def get_current_club(current_user: dict = Depends(get_current_user)):
        """Verifica que el usuario esté logueado y sea CLUB (o Admin)"""
        rol = current_user.get("rol", "").lower()
        # Normalmente permitimos que el Admin también vea lo del Club
        if rol not in ["club", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Acceso denegado: Se requieren permisos de Club"
            )
        return current_user