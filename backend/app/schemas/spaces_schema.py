from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

# --- ESQUEMA BASE ---
class TipoEspacioBase(BaseModel):
    tipo: str = Field(..., min_length=3, max_length=100, examples=["Sala de Juntas", "Coworking"])
    permite_reserva_parcial: bool = Field(default=False, description="Indica si se pueden reservar asientos individuales")

# --- ESQUEMA PARA CREACIÓN (POST) ---
class TipoEspacioCreate(TipoEspacioBase):
    pass

# --- ESQUEMA PARA RESPUESTA (GET) ---
class TipoEspacioResponse(TipoEspacioBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# --- ESQUEMA AVANZADO (Opcional) ---
# Útil si quieres consultar un Tipo y que te devuelva todos los espacios de esa categoría
class TipoEspacioConDetalles(TipoEspacioResponse):
    from .espacio_schema import EspacioResponse # Importación circular evitada con string o dentro de la clase
    espacios: List["EspacioResponse"] = []