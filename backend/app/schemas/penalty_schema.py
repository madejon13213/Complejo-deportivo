from pydantic import BaseModel, ConfigDict
from datetime import date
class PenaltyResponse(BaseModel):
    id: int
    fecha_inicio: date
    fecha_fin: date
    tipo_penalizacion: str
    id_reserva: int
    
    model_config = ConfigDict(from_attributes=True)