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
    
    @staticmethod
    def get_penalty_by_id(id: int, db: Session):
        repo = PenaltyRepository(db)
        try:
            penalty = repo.get_by_id(id)
            if not penalty:
                raise HTTPException(status_code=404, detail="Penalización no encontrada")
            return penalty
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al obtener penalización",
            )
    
    @staticmethod
    def get_penalties_by_user(id_user: int, db: Session):
        repo = PenaltyRepository(db)
        try:
            penalties = repo.get_by_user(id_user)
            return penalties
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al obtener penalizaciones",
            )
    
    @staticmethod
    def get_penalty_by_reservation(id_reserva: int, db: Session):
        repo = PenaltyRepository(db)
        try:
            penalty = repo.get_by_reservation(id_reserva)
            if not penalty:
                raise HTTPException(status_code=404, detail="Penalización no encontrada")
            return penalty
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al obtener penalización",
            )
