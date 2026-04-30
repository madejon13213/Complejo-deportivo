from fastapi import APIRouter, Depends, Response, status, Request
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db
from app.schemas.user_schema import UserRegister, UserLogin, UserResponse
from app.services.user_service import UserService
from app.auth.auth import AuthManager

router = APIRouter(prefix="/users", tags=["Usuarios"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    return UserService.register_user(user_data, db)


@router.post("/login", status_code=status.HTTP_200_OK)
def login(login_data: UserLogin, response: Response, db: Session = Depends(get_db)):
    return UserService.login_user(login_data, db, response)


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(request: Request, response: Response):
    return AuthManager.logout(response, request)


@router.get("/me", status_code=status.HTTP_200_OK)
def get_me(
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db),
):
    user_id = current_user.get("id") or current_user.get("sub")
    return UserService.get_user(int(user_id), db)


@router.get("/getAll", response_model=list[UserResponse], status_code=status.HTTP_200_OK)
def get_all_users(
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db),
):
    return UserService.get_all_users(db)


@router.get("/{user_id}", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_user(
    user_id: int,
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db),
):
    return UserService.get_user(user_id, db)


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: int,
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db),
):
    return UserService.delete_user(user_id, db)


@router.post("/refresh", status_code=status.HTTP_200_OK)
def refresh_token(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    return AuthManager.refresh_access_token(request, response, db)
