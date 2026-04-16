from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional
from datetime import date, time

from pydantic import BaseModel, ConfigDict
from datetime import date, time
from typing import Optional

class ReservationResponse(BaseModel):
    id: int
    fecha: date
    hora_inicio: time
    hora_fin: time
    estado: str
    plazas_parciales: Optional[int] = None
    tipo_reserva: str
    id_user: int
    id_espacio: int

    model_config = ConfigDict(from_attributes=True)