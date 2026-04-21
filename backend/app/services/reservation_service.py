from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.reservation_repository import ReservationRepository
from app.schemas.reservation_schema import ReservationResponse


class ReservationService:
    @staticmethod
    def get_all_reservations(db: Session) -> list[ReservationResponse]:
        repo = ReservationRepository(db)
        try:
            reservations = repo.get_all()
            return reservations
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al intentar recuperar la lista de reservas de la base de datos",
            )
