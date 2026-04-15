from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import date
from typing import Optional

# --- ESQUEMA BASE ---
class PenalizacionBase(BaseModel):
    fecha_inicio: date = Field(..., examples=["2026-04-07"])
    fecha_fin: date = Field(..., examples=["2026-04-14"])
    tipo_penalizacion: str = Field(..., min_length=5, examples=["Cancelación tardía", "Mal uso del espacio"])
    id_reserva: int = Field(..., examples=[10])

    # VALIDACIÓN: Fecha Fin >= Fecha Inicio
    @field_validator("fecha_fin")
    @classmethod
    def validar_periodo(cls, v: date, info):
        if "fecha_inicio" in info.data and v < info.data["fecha_inicio"]:
            raise ValueError("La fecha de fin no puede ser anterior a la de inicio")
        return v

# --- ESQUEMA PARA CREACIÓN (POST) ---
# Usado por el Admin cuando decide penalizar manualmente o por un proceso automático
class PenalizacionCreate(PenalizacionBase):
    pass

# --- ESQUEMA PARA RESPUESTA (GET) ---
class PenalizacionResponse(PenalizacionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# --- ESQUEMA DE ESTADO ---
# Muy útil para el Frontend de Next.js para mostrar un banner de advertencia
class EstadoPenalizacion(BaseModel):
    esta_penalizado: bool
    mensaje: Optional[str] = None
    hasta_fecha: Optional[date] = None