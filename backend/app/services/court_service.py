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
