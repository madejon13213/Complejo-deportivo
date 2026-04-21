from app.repositories.base_repository import BaseRepository
from app.tables.tables import Penalizacion


class PenaltyRepository(BaseRepository):
    def get_all(self) -> list[Penalizacion]:
        return self.db.query(Penalizacion).all()
