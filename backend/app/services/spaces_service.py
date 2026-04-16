from fastapi import HTTPException, Response, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.tables.tables import TipoEspacio
from app.schemas.spaces_schema import SpaceResponse

class SpaceService:

    @staticmethod
    def get_all_spaces(db: Session):
        try:
            espacios = db.query(TipoEspacio).all()
            return espacios
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al intentar recuperar la lista de espacios de la base de datos"
            )