from app.repositories.base_repository import BaseRepository
from app.tables.tables import TipoEspacio

class SpaceRepository(BaseRepository):
    
    def get_all(self) -> list[TipoEspacio]:
        return self.db.query(TipoEspacio).all()

    def get_all_types(self) -> list[TipoEspacio]:
        return self.db.query(TipoEspacio).all()

    def get_by_id(self, tipo_id: int) -> TipoEspacio | None:
        return self.db.query(TipoEspacio).filter(TipoEspacio.id == tipo_id).first()
    