from typing import Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.court_repository import CourtRepository
from app.repositories.space_repository import SpaceRepository
from app.schemas.court_schema import CourtResponse


class CourtService:
    @staticmethod
    def _to_response(court) -> CourtResponse:
        space_type = getattr(court, "tipo_espacio_rel", None)
        return CourtResponse(
            id=court.id,
            nombre=court.nombre,
            precio_hora=float(court.precio_hora),
            capacidad=int(court.capacidad),
            precio_hora_parcial=float(court.precio_hora_parcial) if court.precio_hora_parcial is not None else None,
            id_tipo_espacio=court.id_tipo_espacio,
            tipo_espacio=space_type.tipo if space_type else None,
            permite_reserva_parcial=space_type.permite_reserva_parcial if space_type else None,
        )

    @staticmethod
    def get_filtered_courts(
        db: Session, 
        page: int, 
        limit: int,
        search: Optional[str] = None,
        type_id: Optional[int] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_capacity: Optional[int] = None
    ):
        repo = CourtRepository(db)
        try:
            items, total = repo.get_filtered_paginated(
                page, limit, search, type_id, min_price, max_price, min_capacity
            )
            return {
                "items": [CourtService._to_response(pista) for pista in items],
                "total": total,
                "page": page,
                "limit": limit,
                "total_pages": (total + limit - 1) // limit,
            }
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Error al obtener pistas filtradas",
            )

    @staticmethod
    def get_all_courts(db: Session):
        repo = CourtRepository(db)
        try:
            pistas = repo.get_all()
            return [CourtService._to_response(pista) for pista in pistas]
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Error al obtener espacios",
            )

    @staticmethod
    def get_court_by_id(id: int, db: Session):
        repo = CourtRepository(db)
        try:
            court = repo.get_by_id(id)
            if not court:
                raise HTTPException(status_code=404, detail="Espacio no encontrado")
            return CourtService._to_response(court)
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Error al obtener espacio",
            )

    @staticmethod
    def get_courts_by_type(id_tipo_espacio: int, db: Session, page: int = 1, limit: int = 20):
        repo = CourtRepository(db)
        try:
            items, total = repo.get_by_type(id_tipo_espacio, page, limit)
            return {
                "items": [CourtService._to_response(court) for court in items],
                "total": total,
                "page": page,
                "limit": limit,
                "total_pages": (total + limit - 1) // limit,
            }
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Error al obtener espacios",
            )

    @staticmethod
    def get_courts_by_partial_reservation(permite_reserva_parcial: bool, db: Session):
        repo = CourtRepository(db)
        try:
            courts = repo.get_by_partial_reservation(permite_reserva_parcial)
            return [CourtService._to_response(court) for court in courts]
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Error al filtrar espacios por reserva parcial",
            )
