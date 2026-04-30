from pydantic import BaseModel, ConfigDict
from typing import Optional

class SpaceResponse(BaseModel):
    id: int
    tipo: str
    permite_reserva_parcial: bool

    model_config = ConfigDict(from_attributes=True)

class SpaceCreate(BaseModel):
    tipo: str
    permite_reserva_parcial: bool

    model_config = ConfigDict(from_attributes=True)

class SpaceUpdate(BaseModel):
    tipo: Optional[str] = None
    permite_reserva_parcial: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)


class SpaceSearchResponse(BaseModel):
    items: list[SpaceResponse]
    total: int
    page: int
    limit: int
    total_pages: int
