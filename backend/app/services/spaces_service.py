from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.space_repository import SpaceRepository


class SpaceService:
    @staticmethod
    def get_all_spaces(db: Session):
        repo = SpaceRepository(db)
        try:
            espacios = repo.get_all()
            return espacios
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al intentar recuperar la lista de espacios de la base de datos",
            )
