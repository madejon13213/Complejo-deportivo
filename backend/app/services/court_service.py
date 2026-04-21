from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.court_repository import CourtRepository


class CourtService:
    @staticmethod
    def get_all_courts(db: Session):
        repo = CourtRepository(db)
        try:
            pistas = repo.get_all()
            return pistas
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
            return court
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Error al obtener espacio",
            )
    
    @staticmethod
    def get_courts_by_type(id_tipo_espacio: int, db: Session):
        repo = CourtRepository(db)
        try:
            courts = repo.get_by_type(id_tipo_espacio)
            return courts
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
            return courts
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Error al obtener espacios",
            )
