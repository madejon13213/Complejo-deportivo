from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.reservation_repository import ReservationRepository
from app.schemas.reservation_schema import ReservationResponse, ReservationCreate, ReservationUpdate
from app.tables.tables import Reserva


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
    
    @staticmethod
    def get_reservation_by_id(reservation_id: int, db: Session) -> ReservationResponse:
        """Obtiene una reserva por su ID."""
        repo = ReservationRepository(db)
        try:
            reservation = repo.get_by_id(reservation_id)
            if not reservation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Reserva con ID {reservation_id} no encontrada",
                )
            return reservation
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al intentar recuperar la reserva de la base de datos",
            )

    @staticmethod
    def get_user_reservations(user_id: int, db: Session) -> list[ReservationResponse]:
        """Obtiene todas las reservas de un usuario específico."""
        repo = ReservationRepository(db)
        try:
            reservations = repo.get_by_user(user_id)
            return reservations
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al intentar recuperar las reservas del usuario",
            )

    @staticmethod
    def get_space_reservations(space_id: int, db: Session) -> list[ReservationResponse]:
        """Obtiene todas las reservas de un espacio específico."""
        repo = ReservationRepository(db)
        try:
            reservations = repo.get_by_space(space_id)
            return reservations
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al intentar recuperar las reservas del espacio",
            )

    @staticmethod
    def get_active_reservations(db: Session) -> list[ReservationResponse]:
        """Obtiene solo las reservas activas (próximas o en curso)."""
        repo = ReservationRepository(db)
        try:
            reservations = repo.get_active()
            return reservations
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al intentar recuperar las reservas activas",
            )

    @staticmethod
    def create_reservation(reservation_data: ReservationCreate, db: Session) -> ReservationResponse:
        """Crea una nueva reserva."""
        repo = ReservationRepository(db)
        try:
            # Validar que el espacio y usuario existan (opcional, pero recomendado)
            # space = db.query(Espacio).filter(Espacio.id == reservation_data.id_espacio).first()
            # user = db.query(Usuario).filter(Usuario.id == reservation_data.id_usuario).first()
            # if not space or not user:
            #     raise HTTPException(status_code=404, detail="Espacio o usuario no encontrado")

            # Validar que no haya conflictos de horarios (opcional pero recomendado)
            # conflicting_reservations = repo.get_conflicting_reservations(
            #     reservation_data.id_espacio,
            #     reservation_data.hora_inicio,
            #     reservation_data.hora_fin
            # )
            # if conflicting_reservations:
            #     raise HTTPException(status_code=400, detail="Conflicto de horarios con reservas existentes")

            reserva_dict = reservation_data.dict()
            reserva_dict["estado"] = "Pendiente"
            new_reservation = Reserva(**reserva_dict)
            created_reservation = repo.create(new_reservation)
            return created_reservation
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al crear la reserva: {str(e)}",
            )

    @staticmethod
    def update_reservation(reservation_id: int, reservation_data: ReservationUpdate, db: Session) -> ReservationResponse:
        """Actualiza una reserva existente."""
        repo = ReservationRepository(db)
        try:
            reservation = repo.get_by_id(reservation_id)
            if not reservation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Reserva con ID {reservation_id} no encontrada",
                )

            # Actualizar campos si vienen en el payload
            for field, value in reservation_data.dict().items():
                if value is not None:
                    setattr(reservation, field, value)

            updated_reservation = repo.update(reservation)
            return updated_reservation
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al actualizar la reserva: {str(e)}",
            )

    @staticmethod
    def delete_reservation(reservation_id: int, db: Session) -> dict:
        """Elimina una reserva."""
        repo = ReservationRepository(db)
        try:
            reservation = repo.get_by_id(reservation_id)
            if not reservation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Reserva con ID {reservation_id} no encontrada",
                )

            # Validar que la reserva se pueda eliminar (ej: no esté en progreso)
            # if reservation.hora_inicio <= datetime.now() <= reservation.hora_fin:
            #     raise HTTPException(status_code=400, detail="No se puede eliminar una reserva en progreso")

            deleted = repo.delete(reservation)
            if deleted:
                return {"message": f"Reserva con ID {reservation_id} eliminada exitosamente"}
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="No se pudo eliminar la reserva",
                )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al eliminar la reserva: {str(e)}",
            )
