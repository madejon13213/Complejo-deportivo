from app.repositories.base_repository import BaseRepository
from app.tables.tables import Penalizacion, Reserva

class PenaltyRepository(BaseRepository):
    def get_all(self) -> list[Penalizacion]:
        return self.db.query(Penalizacion).all()

    def get_by_id(self, id: int) -> Penalizacion | None:
        return self.db.query(Penalizacion).filter(Penalizacion.id == id).first()

    def get_by_user(self, id_user: int) -> list[Penalizacion]:
        return self.db.query(Penalizacion).join(Reserva).filter(Reserva.id_user == id_user).all()

    def get_by_reservation(self, id_reserva: int) -> Penalizacion | None:
        return self.db.query(Penalizacion).filter(Penalizacion.id_reserva == id_reserva).first()

    def create(self, penalty: Penalizacion) -> Penalizacion:
        self.db.add(penalty)
        self.db.flush()
        return penalty
