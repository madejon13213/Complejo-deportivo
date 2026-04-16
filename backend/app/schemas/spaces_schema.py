from pydantic import BaseModel, ConfigDict

class SpaceResponse(BaseModel):
    id: int
    tipo: str
    permite_reserva_parcial: bool

    model_config = ConfigDict(from_attributes=True)