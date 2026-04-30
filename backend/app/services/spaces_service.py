from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.space_repository import SpaceRepository


class SpaceService:
    @staticmethod
    def get_all_spaces(db: Session, page: int = 1, limit: int = 20):
        repo = SpaceRepository(db)
        try:
            items, total = repo.get_all_paginated(page, limit)
            total_pages = max(1, (total + limit - 1) // limit)
            return {
                "items": items,
                "total": total,
                "page": page,
                "limit": limit,
                "total_pages": total_pages,
            }
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al intentar recuperar la lista de espacios de la base de datos",
            )
