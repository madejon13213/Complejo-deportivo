from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.tables.tables import Penalizacion

class PenaltyService:
    @staticmethod
    def get_all_penalties(db: Session):
        try:
            penalties = db.query(Penalizacion).all()
            return penalties
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al obtener penalizaciones"
            )
