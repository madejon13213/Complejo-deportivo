import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict

import bcrypt
import jwt
import redis
from fastapi import Depends, HTTPException, Request, Response, status
from fastapi.security import APIKeyCookie
from sqlalchemy.orm import Session

from app.logger.logger_config import logger
from app.utils.roles import ROLE_ADMIN, ROLE_CLUB, normalize_role, role_from_payload

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "redis"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=0,
    decode_responses=True,
)


class AuthManager:
    SECRET_KEY = os.getenv("SECRET_KEY", "tu_clave_secreta_super_segura")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 15
    REFRESH_TOKEN_EXPIRE_DAYS = 7

    cookie_scheme = APIKeyCookie(name="token", auto_error=False)

    @staticmethod
    def _now_ts() -> int:
        return int(datetime.now(timezone.utc).timestamp())

    @staticmethod
    def _token_ttl_from_payload(payload: Dict[str, Any]) -> int:
        exp = payload.get("exp")
        if not exp:
            return 0
        return max(0, int(exp) - AuthManager._now_ts())

    @staticmethod
    def _blacklist_key(token: str) -> str:
        return f"blacklist:{token}"

    @staticmethod
    def _is_blacklisted(token: str) -> bool:
        return bool(redis_client.exists(AuthManager._blacklist_key(token)))

    @staticmethod
    def _blacklist_token_with_payload(token: str, payload: Dict[str, Any]) -> None:
        ttl = AuthManager._token_ttl_from_payload(payload)
        if ttl > 0:
            redis_client.setex(AuthManager._blacklist_key(token), ttl, "true")

    @staticmethod
    def _decode_token(token: str, expected_type: str) -> Dict[str, Any]:
        try:
            payload = jwt.decode(token, AuthManager.SECRET_KEY, algorithms=[AuthManager.ALGORITHM])
        except jwt.ExpiredSignatureError:
            logger.warning("[AuthManager._decode_token] token expirado expected_type=%s", expected_type)
            raise HTTPException(status_code=401, detail="Token expirado")
        except jwt.PyJWTError:
            logger.warning("[AuthManager._decode_token] token inválido expected_type=%s", expected_type)
            raise HTTPException(status_code=401, detail="Token invalido")

        token_type = payload.get("type")
        if token_type != expected_type:
            logger.warning(
                "[AuthManager._decode_token] tipo inválido expected=%s got=%s",
                expected_type,
                token_type,
            )
            raise HTTPException(status_code=401, detail="Tipo de token invalido")

        if AuthManager._is_blacklisted(token):
            logger.warning("[AuthManager._decode_token] token revocado expected_type=%s", expected_type)
            raise HTTPException(status_code=401, detail="Token revocado")

        return payload

    @staticmethod
    def create_access_token(data: dict) -> str:
        to_encode = data.copy()
        if "id" in to_encode:
            to_encode["sub"] = str(to_encode["id"])

        expire = datetime.now(timezone.utc) + timedelta(minutes=AuthManager.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update(
            {
                "exp": int(expire.timestamp()),
                "type": "access",
                "rol": normalize_role(to_encode.get("rol")),
            }
        )
        return jwt.encode(to_encode, AuthManager.SECRET_KEY, algorithm=AuthManager.ALGORITHM)

    @staticmethod
    def create_refresh_token(user_id: int) -> str:
        expire = datetime.now(timezone.utc) + timedelta(days=AuthManager.REFRESH_TOKEN_EXPIRE_DAYS)
        payload = {
            "sub": str(user_id),
            "type": "refresh",
            "exp": int(expire.timestamp()),
        }
        token = jwt.encode(payload, AuthManager.SECRET_KEY, algorithm=AuthManager.ALGORITHM)

        redis_client.setex(
            f"refresh:{token}",
            timedelta(days=AuthManager.REFRESH_TOKEN_EXPIRE_DAYS),
            str(user_id),
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
            **common_settings,
        )

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            max_age=AuthManager.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
            **common_settings,
        )

    @staticmethod
    def refresh_access_token(request: Request, response: Response, db: Session) -> dict:
        refresh_token = request.cookies.get("refresh_token")
        logger.info("[AuthManager.refresh_access_token] intento refresh")

        if not refresh_token:
            logger.warning("[AuthManager.refresh_access_token] sin refresh_token")
            raise HTTPException(status_code=401, detail="No hay token de refresco")

        payload = AuthManager._decode_token(refresh_token, expected_type="refresh")

        stored_user_id = redis_client.get(f"refresh:{refresh_token}")
        if not stored_user_id:
            logger.warning("[AuthManager.refresh_access_token] refresh no existe en redis")
            raise HTTPException(status_code=401, detail="Refresh token invalido o expirado en servidor")

        if str(payload.get("sub")) != str(stored_user_id):
            logger.warning("[AuthManager.refresh_access_token] sub no coincide stored_user_id=%s", stored_user_id)
            raise HTTPException(status_code=401, detail="Refresh token no coincide con la sesion")

        from app.tables.tables import Usuario

        user = db.query(Usuario).filter(Usuario.id == int(stored_user_id)).first()
        if not user:
            logger.warning("[AuthManager.refresh_access_token] usuario no encontrado user_id=%s", stored_user_id)
            raise HTTPException(status_code=401, detail="Usuario no encontrado")

        rol_nombre = normalize_role(user.rol_rel.rol if user.rol_rel else "CLIENTE")

        new_access = AuthManager.create_access_token(
            {
                "id": user.id,
                "name": user.nombre,
                "rol": rol_nombre,
            }
        )

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

        logger.info("[AuthManager.refresh_access_token] refresh ok user_id=%s rol=%s", user.id, rol_nombre)
        return {"status": "Access token actualizado", "newToken": new_access}

    @staticmethod
    def logout(response: Response, request: Request):
        token = request.cookies.get("token")
        refresh = request.cookies.get("refresh_token")

        if token:
            try:
                payload = jwt.decode(
                    token,
                    AuthManager.SECRET_KEY,
                    algorithms=[AuthManager.ALGORITHM],
                    options={"verify_exp": False},
                )
                AuthManager._blacklist_token_with_payload(token, payload)
            except jwt.PyJWTError:
                logger.warning("[AuthManager.logout] access token inválido al cerrar sesión")

        if refresh:
            try:
                payload = jwt.decode(
                    refresh,
                    AuthManager.SECRET_KEY,
                    algorithms=[AuthManager.ALGORITHM],
                    options={"verify_exp": False},
                )
                AuthManager._blacklist_token_with_payload(refresh, payload)
            except jwt.PyJWTError:
                logger.warning("[AuthManager.logout] refresh token inválido al cerrar sesión")

            redis_client.delete(f"refresh:{refresh}")

        response.delete_cookie("token", path="/")
        response.delete_cookie("refresh_token", path="/")
        logger.info("[AuthManager.logout] sesión cerrada")
        return {"message": "Sesion cerrada"}

    @staticmethod
    async def get_current_user(request: Request):
        token = request.cookies.get("token")

        if not token:
            logger.warning("[AuthManager.get_current_user] sin cookie token")
            raise HTTPException(status_code=401, detail="No hay cookie de sesion")

        payload = AuthManager._decode_token(token, expected_type="access")
        payload["rol"] = role_from_payload(payload)
        logger.info(
            "[AuthManager.get_current_user] user_id=%s rol=%s",
            payload.get("id") or payload.get("sub"),
            payload.get("rol"),
        )
        return payload

    @staticmethod
    async def get_current_admin(current_user: dict = Depends(get_current_user)):
        rol = normalize_role(current_user.get("rol", ""))
        if rol != ROLE_ADMIN:
            logger.warning("[AuthManager.get_current_admin] acceso denegado rol=%s", rol)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acceso denegado: Se requieren permisos de Administrador",
            )
        return current_user

    @staticmethod
    async def get_current_club(current_user: dict = Depends(get_current_user)):
        rol = normalize_role(current_user.get("rol", ""))
        if rol not in [ROLE_CLUB, ROLE_ADMIN]:
            logger.warning("[AuthManager.get_current_club] acceso denegado rol=%s", rol)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acceso denegado: Se requieren permisos de Club",
            )
        return current_user