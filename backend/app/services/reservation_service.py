from datetime import date
from math import ceil
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.reservation_repository import ReservationRepository
from app.schemas.reservation_schema import (
    ReservationCreate,
    ReservationResponse,
    ReservationSearchItem,
    ReservationSearchResponse,
    ReservationUpdate,
)
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
    def get_filtered_reservations(
        db: Session,
        fecha: Optional[date],
        usuario: Optional[str],
        page: int,
        limit: int,
    ) -> ReservationSearchResponse:
        repo = ReservationRepository(db)
        try:
            rows, total = repo.get_filtered_paginated(fecha=fecha, usuario=usuario, page=page, limit=limit)
            items = [
                ReservationSearchItem(
                    id=reserva.id,
                    fecha=reserva.fecha,
                    hora_inicio=reserva.hora_inicio,
                    hora_fin=reserva.hora_fin,
                    estado=reserva.estado,
                    plazas_parciales=reserva.plazas_parciales,
                    tipo_reserva=reserva.tipo_reserva,
                    id_user=reserva.id_user,
                    id_espacio=reserva.id_espacio,
                    usuario_nombre=" ".join(
                        [part for part in [usuario_row.nombre, usuario_row.pri_ape, usuario_row.seg_ape] if part]
                    ),
                )
                for reserva, usuario_row in rows
            ]

            total_pages = max(1, ceil(total / limit)) if limit > 0 else 1
            return ReservationSearchResponse(
                items=items,
                total=total,
                page=page,
                limit=limit,
                total_pages=total_pages,
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al intentar filtrar reservas",
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

            deleted = repo.delete(reservation)
            if deleted:
                return {"message": f"Reserva con ID {reservation_id} eliminada exitosamente"}

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
