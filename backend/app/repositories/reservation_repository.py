from app.repositories.base_repository import BaseRepository
from app.tables.tables import Reserva
from datetime import datetime
from typing import Optional


class ReservationRepository(BaseRepository):
    def get_all(self) -> list[Reserva]:
        return self.db.query(Reserva).all()

    def get_by_id(self, id: int) -> Optional[Reserva]:
        return self.db.query(Reserva).filter(Reserva.id == id).first()

    def get_by_user(self, user_id: int) -> list[Reserva]:
        return self.db.query(Reserva).filter(Reserva.id_user == user_id).all()

    def get_by_space(self, space_id: int) -> list[Reserva]:
        return self.db.query(Reserva).filter(Reserva.id_espacio == space_id).all()

    def get_active(self) -> list[Reserva]:
        ahora = datetime.now()
        ahora_fecha = ahora.date()
        ahora_hora = ahora.time()
        return self.db.query(Reserva).filter(
            (Reserva.fecha > ahora_fecha) | 
            ((Reserva.fecha == ahora_fecha) & (Reserva.hora_fin > ahora_hora))
        ).all()

    def create(self, reserva: Reserva) -> Reserva:
        self.db.add(reserva)
        self.db.commit()
        self.db.refresh(reserva)
        return reserva

    def update(self, reserva: Reserva) -> Reserva:
        self.db.merge(reserva)
        self.db.commit()
        self.db.refresh(reserva)
        return reserva

    def delete(self, reserva: Reserva) -> bool:
        self.db.delete(reserva)
        self.db.commit()
        return True
