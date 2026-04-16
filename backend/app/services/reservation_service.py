from fastapi import HTTPException, Response, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.tables.tables import Reserva
from app.schemas.reservation_schema import ReservationResponse

class ReservationService:

    @staticmethod
    def get_all_reservations(db: Session) -> list[ReservationResponse]:
        try:
            reservations = db.query(Reserva).all()
            return reservations
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al intentar recuperar la lista de reservas de la base de datos"
            )