import bcrypt
from fastapi import HTTPException, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.auth import AuthManager
from app.logger.logger_config import logger
from app.repositories.user_repository import UserRepository
from app.schemas.user_schema import UserLogin, UserRegister
from app.tables.tables import Rol, Usuario
from app.utils.roles import ROLE_CLIENTE, normalize_role


class UserService:
    @staticmethod
    def register_user(user_data: UserRegister, db: Session) -> dict:
        repo = UserRepository(db)

        existing_user = repo.get_by_email(user_data.email)
        if existing_user:
            logger.warning("[UserService.register_user] email already exists email=%s", user_data.email)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado",
            )

        role_type = normalize_role(user_data.rol)
        role_record = db.query(Rol).filter(Rol.rol.ilike(role_type)).first()
        if not role_record:
            role_record = db.query(Rol).filter(Rol.rol.ilike(ROLE_CLIENTE)).first()
        if not role_record:
            logger.error("[UserService.register_user] role not valid role_type=%s", role_type)
            raise HTTPException(status_code=400, detail="Rol no válido")

        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(user_data.password.encode("utf-8"), salt).decode("utf-8")

        nuevo_usuario = Usuario(
            nombre=user_data.nombre,
            pri_ape=user_data.pri_ape,
            seg_ape=user_data.seg_ape,
            email=user_data.email,
            contraseña=hashed_password,
            telefono=user_data.telefono,
            id_rol=role_record.id,
        )

        try:
            repo.create(nuevo_usuario)
            logger.info("[UserService.register_user] created user_id=%s role=%s", nuevo_usuario.id, role_type)
            return {
                "id": nuevo_usuario.id,
                "email": nuevo_usuario.email,
                "rol": role_type,
                "mensaje": "Usuario creado exitosamente",
            }
        except IntegrityError:
            db.rollback()
            logger.exception("[UserService.register_user] integrity error email=%s", user_data.email)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al guardar el usuario en la base de datos",
            )

    @staticmethod
    def login_user(login_data: UserLogin, db: Session, response: Response) -> dict:
        repo = UserRepository(db)
        usuario = repo.get_by_email(login_data.email)

        if not usuario or not bcrypt.checkpw(
            login_data.password.encode("utf-8"), usuario.contraseña.encode("utf-8")
        ):
            logger.warning("[UserService.login_user] invalid credentials email=%s", login_data.email)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos",
            )

        rol_nombre = normalize_role(usuario.rol_rel.rol if usuario.rol_rel else ROLE_CLIENTE)

        access_token, expires_at = AuthManager.create_access_token(
            {"id": usuario.id, "name": usuario.nombre, "rol": rol_nombre}
        )
        refresh_token = AuthManager.create_refresh_token(usuario.id)

        AuthManager._set_auth_cookies(response, access_token, refresh_token)
        logger.info("[UserService.login_user] success user_id=%s role=%s", usuario.id, rol_nombre)

        return {
            "success": True,
            "id": usuario.id,
            "name": usuario.nombre,
            "email": usuario.email,
            "rol": rol_nombre,
            "expires_at": expires_at,
            "mensaje": "Inicio de sesión exitoso",
        }

    @staticmethod
    def get_all_users(db: Session):
        repo = UserRepository(db)
        try:
            users = repo.get_all()
            for user in users:
                user.rol = normalize_role(user.rol_rel.rol if user.rol_rel else ROLE_CLIENTE)
            logger.info("[UserService.get_all_users] total=%s", len(users))
            return users
        except Exception:
            logger.exception("[UserService.get_all_users] error")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al intentar recuperar la lista de usuarios de la base de datos",
            )

    @staticmethod
    def get_user(user_id: int, db: Session):
        repo = UserRepository(db)
        try:
            usuario = repo.get_by_id(user_id)

            if not usuario:
                logger.warning("[UserService.get_user] not found user_id=%s", user_id)
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Usuario con ID {user_id} no encontrado",
                )

            usuario.rol = normalize_role(usuario.rol_rel.rol if usuario.rol_rel else ROLE_CLIENTE)
            logger.info("[UserService.get_user] found user_id=%s", user_id)
            return usuario
        except HTTPException as http_exc:
            raise http_exc
        except Exception:
            logger.exception("[UserService.get_user] error user_id=%s", user_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ocurrió un error interno al intentar recuperar el usuario",
            )

    @staticmethod
    def delete_user(user_id: int, db: Session):
        repo = UserRepository(db)
        try:
            usuario = repo.get_by_id(user_id)

            if not usuario:
                logger.warning("[UserService.delete_user] not found user_id=%s", user_id)
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Usuario con ID {user_id} no encontrado",
                )

            repo.delete(usuario)
            logger.info("[UserService.delete_user] deleted user_id=%s", user_id)
            return {"mensaje": f"Usuario con ID {user_id} eliminado exitosamente"}
        except HTTPException as http_exc:
            raise http_exc
        except Exception:
            logger.exception("[UserService.delete_user] error user_id=%s", user_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ocurrió un error interno al intentar eliminar el usuario",
            )