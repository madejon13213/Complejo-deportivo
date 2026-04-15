from fastapi import APIRouter, Depends, Response, status, Request, HTTPException, Cookie, JSONResponse
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional  

from app.database import get_db
from app.schemas.user_schema import UserRegister, UserLogin, UserResponse
from services.user_service import UserService
from app.auth.auth import AuthManager

router = APIRouter(prefix="/users", tags=["Usuarios"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Registra un nuevo usuario en la base de datos de manera segura y hashea su contraseña.
    """
    return UserService.register_user(user_data, db)

@router.post("/login", status_code=status.HTTP_200_OK)
def login(login_data: UserLogin, response: Response, db: Session = Depends(get_db)):

    return UserService.login_user(login_data, db, response)

@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(request: Request, response: Response):
    """
    Cierra sesión eliminando las cookies y mandando a blacklist el token.
    """
    return AuthManager.logout(response, request)
@router.get("/me", status_code=status.HTTP_200_OK)
def get_me(current_user: Dict[str, Any] = Depends(AuthManager.get_current_user)):
    """
    Devuelve la información del usuario en sesión actual validando la cookie.
    """
    return current_user

@router.get("/getAll", response_model=list[UserResponse], status_code=status.HTTP_200_OK)
def get_all_users(
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db)
):  
    return UserService.get_all_users(db)


@router.post("/refresh")
async def refresh_token(
    request: Request, 
    response: Response, 
    db: Session = Depends(get_db)
):
    try:
        AuthManager.refresh_access_token(request, response, db)

        new_access_token = None
        for cookie_header in response.headers.getlist("set-cookie"):
            if "token=" in cookie_header:
                new_access_token = cookie_header.split("token=")[1].split(";")[0]
                break

        
        return JSONResponse(
            content={"newToken": new_access_token},
            headers=dict(response.headers) 
        )
        
    except HTTPException as e:
        raise e

