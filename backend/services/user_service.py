import bcrypt
from fastapi import HTTPException, Response, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.tables.tables import Usuario
from app.schemas.user_schema import UserRegister, UserLogin
from app.auth.auth import AuthManager

class UserService:
    @staticmethod
    def register_user(user_data: UserRegister, db: Session) -> dict:
        
        existing_user = db.query(Usuario).filter(Usuario.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )

        
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), salt).decode('utf-8')

        
        nuevo_usuario = Usuario(
            nombre=user_data.nombre,
            pri_ape=user_data.pri_ape,
            seg_ape=user_data.seg_ape,
            email=user_data.email,
            contraseña=hashed_password,
            telefono=user_data.telefono,
            id_rol=user_data.id_rol
        )

        try:
            db.add(nuevo_usuario)
            db.commit()
            db.refresh(nuevo_usuario)
            return {
                "id": nuevo_usuario.id,
                "email": nuevo_usuario.email,
                "mensaje": "Usuario creado exitosamente"
            }
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al guardar el usuario en la base de datos"
            )

    @staticmethod
    def login_user(login_data: UserLogin, db: Session, response: Response) -> dict:
        
        usuario = db.query(Usuario).filter(Usuario.email == login_data.email).first()
        
        
        if not usuario or not bcrypt.checkpw(login_data.password.encode('utf-8'), usuario.contraseña.encode('utf-8')):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos"
            )

        rol_nombre = usuario.rol_rel.rol.lower() if usuario.rol_rel else "cliente"

        # Generar tokens
        access_token = AuthManager.create_access_token({
            "id": usuario.id, 
            "name": usuario.nombre, 
            "rol": rol_nombre
        })
        refresh_token = AuthManager.create_refresh_token(usuario.id)

        # Configurar cookies
        AuthManager._set_auth_cookies(response, access_token, refresh_token)

        return {
            "success": True, 
            "id": usuario.id, 
            "name": usuario.nombre, 
            "email": usuario.email,
            "rol": rol_nombre,
            "mensaje": "Inicio de sesión exitoso"
        }

    @staticmethod
    def get_all_users(db: Session):
        # Traemos todos los registros de la tabla Usuario
        users = db.query(Usuario).all()
        if not users:
            return []
        return users