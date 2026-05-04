from typing import Optional
from app.repositories.base_repository import BaseRepository
from app.tables.tables import Espacio, TipoEspacio


class CourtRepository(BaseRepository):
    def get_filtered_paginated(
        self, 
        page: int, 
        limit: int, 
        search: Optional[str] = None,
        type_id: Optional[int] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_capacity: Optional[int] = None
    ) -> tuple[list[Espacio], int]:
        from sqlalchemy import func
        from sqlalchemy.orm import joinedload
        
        query = self.db.query(Espacio).options(joinedload(Espacio.tipo_espacio_rel))
        
        if search:
            normalized = f"%{search.strip().lower()}%"
            query = query.filter(func.lower(Espacio.nombre).like(normalized))
            
        if type_id:
            query = query.filter(Espacio.id_tipo_espacio == type_id)
            
        if min_price is not None:
            query = query.filter(Espacio.precio_hora >= min_price)
            
        if max_price is not None:
            query = query.filter(Espacio.precio_hora <= max_price)
            
        if min_capacity is not None:
            query = query.filter(Espacio.capacidad >= min_capacity)
            
        total = query.count()
        items = query.order_by(Espacio.nombre).offset((page - 1) * limit).limit(limit).all()
        return items, total

    def get_by_id(self, id: int) -> Espacio | None:
        from sqlalchemy.orm import joinedload
        return self.db.query(Espacio).options(joinedload(Espacio.tipo_espacio_rel)).filter(Espacio.id == id).first()

    def get_by_type(self, id_tipo_espacio: int, page: int, limit: int) -> tuple[list[Espacio], int]:
        from sqlalchemy.orm import joinedload
        query = self.db.query(Espacio).options(joinedload(Espacio.tipo_espacio_rel)).filter(Espacio.id_tipo_espacio == id_tipo_espacio)
        total = query.count()
        items = query.offset((page - 1) * limit).limit(limit).all()
        return items, total

    def get_by_partial_reservation(self, permite_reserva_parcial: bool) -> list[Espacio]:
        return self.db.query(Espacio).join(TipoEspacio).filter(TipoEspacio.permite_reserva_parcial == permite_reserva_parcial).all()

    def create(self, court_data: dict) -> Espacio:
        court = Espacio(**court_data)
        self.db.add(court)
        self.db.commit()
        self.db.refresh(court)
        return court

    def update(self, id: int, court_data: dict) -> Espacio | None:
        court = self.get_by_id(id)
        if not court:
            return None
        for key, value in court_data.items():
            if value is not None:
                setattr(court, key, value)
        self.db.commit()
        self.db.refresh(court)
        return court

    def delete(self, id: int) -> bool:
        court = self.get_by_id(id)
        if not court:
            return False
        self.db.delete(court)
        self.db.commit()
        return True
