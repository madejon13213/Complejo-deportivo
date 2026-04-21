from app.repositories.base_repository import BaseRepository
from app.tables.tables import Espacio


class CourtRepository(BaseRepository):
    def get_all(self) -> list[Espacio]:
        return self.db.query(Espacio).all()
