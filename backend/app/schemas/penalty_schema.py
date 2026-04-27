from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class PenaltyResponse(BaseModel):
    id: int
    fecha_inicio: date
    fecha_fin: date
    tipo_penalizacion: str
    id_reserva: int

    model_config = ConfigDict(from_attributes=True)


class PenaltyCreate(BaseModel):
    id_reserva: int
    motivo: str = Field(min_length=1, max_length=100)
    fecha_penalizacion: Optional[date] = None


class PenaltyUpdate(BaseModel):
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    tipo_penalizacion: Optional[str] = None
    id_reserva: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
