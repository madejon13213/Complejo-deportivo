from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional
from datetime import date, time

# --- ESQUEMA BASE ---
class ReservaBase(BaseModel):
    fecha: date = Field(..., examples=["2026-05-15"])
    hora_inicio: time = Field(..., examples=["10:00:00"])
    hora_fin: time = Field(..., examples=["12:00:00"])
    plazas_parciales: Optional[int] = Field(None, gt=0, examples=[2])
    tipo_reserva: str = Field(..., examples=["Completa", "Parcial"])
    id_espacio: int = Field(..., examples=[1])

    # VALIDACIÓN LÓGICA: Hora Fin > Hora Inicio
    @field_validator("hora_fin")
    @classmethod
    def validar_horario(cls, v: time, info):
        if "hora_inicio" in info.data and v <= info.data["hora_inicio"]:
            raise ValueError("La hora de fin debe ser posterior a la de inicio")
        return v

# --- ESQUEMA PARA CREACIÓN (POST) ---
class ReservaCreate(ReservaBase):
    # El id_user no suele pedirse en el body, se saca del token (current_user)
    pass

# --- ESQUEMA PARA RESPUESTA (GET) ---
class ReservaResponse(ReservaBase):
    id: int
    id_user: int
    estado: str = Field(..., examples=["Confirmada", "Pendiente", "Cancelada"])

    model_config = ConfigDict(from_attributes=True)

# --- ESQUEMA DETALLADO (Para el historial del usuario) ---
class ReservaDetallada(ReservaResponse):
    # Aquí podrías incluir info del espacio para no mostrar solo el ID en el front
    nombre_espacio: Optional[str] = None
    usuario_nombre: Optional[str] = None