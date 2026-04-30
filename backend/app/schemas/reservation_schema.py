from datetime import date, time
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ReservationEstimateRequest(BaseModel):
    hora_inicio: time
    hora_fin: time
    id_espacio: int
    numero_personas: Optional[int] = 1

class ReservationEstimateResponse(BaseModel):
    precio_estimado: float



class ReservationResponse(BaseModel):
    id: int
    fecha: date
    hora_inicio: time
    hora_fin: time
    estado: str
    plazas_parciales: Optional[int] = None
    tipo_reserva: str
    precio_total: float
    id_user: int
    id_espacio: int

    model_config = ConfigDict(from_attributes=True)


class ReservationCreate(BaseModel):
    fecha: date
    hora_inicio: time
    hora_fin: time
    plazas_parciales: Optional[int] = None
    numero_personas: Optional[int] = None
    tipo_reserva: str
    id_user: int
    id_espacio: int

    model_config = ConfigDict(from_attributes=True)


class ReservationUpdate(BaseModel):
    fecha: Optional[date] = None
    hora_inicio: Optional[time] = None
    hora_fin: Optional[time] = None
    estado: Optional[str] = None
    plazas_parciales: Optional[int] = None
    tipo_reserva: Optional[str] = None
    id_user: Optional[int] = None
    id_espacio: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class ReservationSearchItem(BaseModel):
    id: int
    fecha: date
    hora_inicio: time
    hora_fin: time
    estado: str
    plazas_parciales: Optional[int] = None
    tipo_reserva: str
    precio_total: float
    id_user: int
    id_espacio: int
    usuario_nombre: str


class ReservationSearchResponse(BaseModel):
    items: list[ReservationSearchItem]
    total: int
    page: int
    limit: int
    total_pages: int
