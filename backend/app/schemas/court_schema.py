from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from pydantic import BaseModel, ConfigDict
from typing import Optional

class CourtResponse(BaseModel):
    id: int
    nombre: str
    precio_hora: float
    capacidad: int
    precio_hora_parcial: Optional[float] = None
    id_tipo_espacio: int
    tipo_espacio: Optional[str] = None
    permite_reserva_parcial: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)