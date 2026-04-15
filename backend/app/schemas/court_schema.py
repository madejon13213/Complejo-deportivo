from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from decimal import Decimal

# --- ESQUEMA BASE ---
# Contiene los campos que comparten tanto la creación como la lectura.
class EspacioBase(BaseModel):
    nombre: str = Field(..., min_length=3, max_length=100, examples=["Sala de Juntas A"])
    precio_hora: Decimal = Field(..., gt=0, decimal_places=2, examples=[25.50])
    capacidad: int = Field(..., gt=0, examples=[10])
    # Este es opcional porque solo aplica si el tipo de espacio permite reserva parcial
    precio_hora_parcial: Optional[Decimal] = Field(None, gt=0, decimal_places=2, examples=[5.00])
    id_tipo_espacio: int = Field(..., examples=[1])

# --- ESQUEMA PARA CREACIÓN (POST) ---
# Se usa cuando recibes datos del frontend para insertar un nuevo espacio.
class EspacioCreate(EspacioBase):
    pass

# --- ESQUEMA PARA RESPUESTA (GET) ---
# Se usa para devolver datos al frontend. Incluye el ID que genera la base de datos.
class EspacioResponse(EspacioBase):
    id: int

    # Configuración para que Pydantic pueda leer objetos de SQLAlchemy
    model_config = ConfigDict(from_attributes=True)

# --- ESQUEMA EXTRA (Opcional) ---
# Si quieres devolver el espacio con el nombre del tipo de espacio ya incluido (JOIN)
class EspacioConTipo(EspacioResponse):
    tipo_nombre: Optional[str] = None