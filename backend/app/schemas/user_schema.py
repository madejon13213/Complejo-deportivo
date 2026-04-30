from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


class UserRegister(BaseModel):
    nombre: str = Field(..., max_length=100)
    pri_ape: str = Field(..., max_length=100)
    seg_ape: Optional[str] = Field(None, max_length=100)
    email: EmailStr
    password: str = Field(..., description="Contraseña en texto plano a encriptar")
    repeat_password: str = Field(..., description="Repite la contraseña")
    telefono: Optional[str] = Field(None, max_length=20)
    rol: str = Field(default="CLIENTE")

    @field_validator('password')
    def validate_password(cls, v: str) -> str:
        """Comprueba que la contraseña tenga al menos 6 caracteres, incluya un número y una mayúscula."""
        if len(v) < 6:
            raise ValueError('La contraseña debe tener al menos 6 caracteres')
        if not any(c.isdigit() for c in v):
            raise ValueError('La contraseña debe contener al menos un número')
        if not any(c.isupper() for c in v):
            raise ValueError('La contraseña debe contener al menos una letra mayúscula')
        return v

    @model_validator(mode='after')
    def passwords_match(self) -> 'UserRegister':
        if self.password != self.repeat_password:
            raise ValueError('Las contraseñas no coinciden')
        return self


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
