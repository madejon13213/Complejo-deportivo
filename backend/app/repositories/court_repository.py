from app.repositories.base_repository import BaseRepository
from app.tables.tables import Espacio, TipoEspacio


class CourtRepository(BaseRepository):
    def get_all(self) -> list[Espacio]:
        return self.db.query(Espacio).all()

    def get_by_id(self, id: int) -> Espacio | None:
        return self.db.query(Espacio).filter(Espacio.id == id).first()

    def get_by_type(self, id_tipo_espacio: int) -> list[Espacio]:
        return self.db.query(Espacio).filter(Espacio.id_tipo_espacio == id_tipo_espacio).all()

    def get_by_partial_reservation(self, permite_reserva_parcial: bool) -> list[Espacio]:
        return self.db.query(Espacio).join(TipoEspacio).filter(TipoEspacio.permite_reserva_parcial == permite_reserva_parcial).all()
