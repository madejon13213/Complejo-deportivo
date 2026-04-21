from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional


class PenaltyResponse(BaseModel):
    id: int
    fecha_inicio: date
    fecha_fin: date
    tipo_penalizacion: str
    id_reserva: int
    
    model_config = ConfigDict(from_attributes=True)

class PenaltyCreate(BaseModel):
    fecha_inicio: date
    fecha_fin: date
    tipo_penalizacion: str
    id_reserva: int
    
    model_config = ConfigDict(from_attributes=True)

class PenaltyUpdate(BaseModel):
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    tipo_penalizacion: Optional[str] = None
    id_reserva: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)
