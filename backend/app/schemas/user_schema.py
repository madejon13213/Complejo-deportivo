from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    nombre: str = Field(..., max_length=100)
    pri_ape: str = Field(..., max_length=100)
    seg_ape: Optional[str] = Field(None, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, description="Contraseña en texto plano a encriptar")
    telefono: Optional[str] = Field(None, max_length=20)
    rol: str = Field(default="CLIENTE")


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserResponse(BaseModel):
    id: int
    nombre: str
    pri_ape: str
    seg_ape: Optional[str] = None
    email: EmailStr
    telefono: Optional[str] = None
    rol: str

    class Config:
        from_attributes = True
