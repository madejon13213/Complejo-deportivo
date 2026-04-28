from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    id: int
    tipo: str
    mensaje: str
    leida: bool
    creada_en: datetime
    id_user: int
    id_reserva: int | None = None

    model_config = ConfigDict(from_attributes=True)


class NotificationMarkReadRequest(BaseModel):
    notification_id: int
