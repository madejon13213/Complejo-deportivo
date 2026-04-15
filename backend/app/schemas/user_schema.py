from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserRegister(BaseModel):
    nombre: str = Field(..., max_length=100)
    pri_ape: str = Field(..., max_length=100)
    seg_ape: Optional[str] = Field(None, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, description="Contraseña en texto plano a encriptar")
    telefono: Optional[str] = Field(None, max_length=20)
    id_rol: int = Field(default=2, description="Comercialmente, 2 es Cliente. 1 es Admin.")

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
    id_rol: int
    
    class Config:
        from_attributes = True
