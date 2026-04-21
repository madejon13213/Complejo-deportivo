from app.repositories.base_repository import BaseRepository
from app.tables.tables import Reserva


class ReservationRepository(BaseRepository):
    def get_all(self) -> list[Reserva]:
        return self.db.query(Reserva).all()
