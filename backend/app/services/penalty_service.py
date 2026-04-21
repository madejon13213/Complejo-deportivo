from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.penalty_repository import PenaltyRepository


class PenaltyService:
    @staticmethod
    def get_all_penalties(db: Session):
        repo = PenaltyRepository(db)
        try:
            penalties = repo.get_all()
            return penalties
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al obtener penalizaciones",
            )
