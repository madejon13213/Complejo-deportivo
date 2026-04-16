from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.tables.tables import Espacio

class CourtService:
    @staticmethod
    def get_all_courts(db: Session):
        try:
            pistas = db.query(Espacio).all()
            return pistas
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail="Error al obtener espacios"
            )