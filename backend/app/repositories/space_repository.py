from app.repositories.base_repository import BaseRepository
from app.tables.tables import TipoEspacio


class SpaceRepository(BaseRepository):
    def get_all(self) -> list[TipoEspacio]:
        return self.db.query(TipoEspacio).all()
