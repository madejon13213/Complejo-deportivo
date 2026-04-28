from datetime import date, datetime
from math import ceil
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.reservation_repository import ReservationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.reservation_schema import (
    ReservationCreate,
    ReservationResponse,
    ReservationSearchItem,
    ReservationSearchResponse,
    ReservationUpdate,
)
from app.services.notification_service import NotificationService
from app.tables.tables import Reserva
from app.utils.roles import ROLE_CLIENTE, can_override_client_reservation, normalize_role


class ReservationService:
    @staticmethod
    def _compute_status(fecha: date, hora_inicio, hora_fin) -> str:
        now = datetime.now()
        today = now.date()
        current_time = now.time().replace(microsecond=0)

        if fecha > today or (fecha == today and hora_inicio > current_time):
            return "Pendiente"
        if fecha == today and hora_inicio <= current_time < hora_fin:
            return "En curso"
        return "Finalizada"

    @staticmethod
    def _refresh_statuses(reservations: list[Reserva]) -> None:
        for reservation in reservations:
            if reservation.estado == "Cancelada":
                continue
            reservation.estado = ReservationService._compute_status(
                reservation.fecha,
                reservation.hora_inicio,
                reservation.hora_fin,
            )

    @staticmethod
    def get_all_reservations(db: Session) -> list[ReservationResponse]:
        repo = ReservationRepository(db)
        try:
            reservations = repo.get_all()
            ReservationService._refresh_statuses(reservations)
            db.commit()
            return reservations
        except Exception:
            db.rollback()
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
            ReservationService._refresh_statuses([reserva for reserva, _ in rows])
            db.commit()

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
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al intentar filtrar reservas",
            )

    @staticmethod
    def get_reservation_by_id(reservation_id: int, db: Session) -> ReservationResponse:
        repo = ReservationRepository(db)
        try:
            reservation = repo.get_by_id(reservation_id)
            if not reservation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Reserva con ID {reservation_id} no encontrada",
                )
            ReservationService._refresh_statuses([reservation])
            db.commit()
            return reservation
        except HTTPException:
            raise
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al intentar recuperar la reserva de la base de datos",
            )

    @staticmethod
    def get_user_reservations(user_id: int, db: Session) -> list[ReservationResponse]:
        repo = ReservationRepository(db)
        try:
            reservations = repo.get_by_user(user_id)
            ReservationService._refresh_statuses(reservations)
            db.commit()
            return reservations
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al intentar recuperar las reservas del usuario",
            )

    @staticmethod
    def get_space_reservations(space_id: int, db: Session) -> list[ReservationResponse]:
        repo = ReservationRepository(db)
        try:
            reservations = repo.get_by_space(space_id)
            ReservationService._refresh_statuses(reservations)
            db.commit()
            return reservations
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al intentar recuperar las reservas del espacio",
            )

    @staticmethod
    def get_active_reservations(db: Session) -> list[ReservationResponse]:
        repo = ReservationRepository(db)
        try:
            reservations = repo.get_active()
            ReservationService._refresh_statuses(reservations)
            db.commit()
            return reservations
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al intentar recuperar las reservas activas",
            )

    @staticmethod
    def create_reservation(
        reservation_data: ReservationCreate,
        db: Session,
        actor_role: str,
    ) -> ReservationResponse:
        repo = ReservationRepository(db)
        user_repo = UserRepository(db)

        try:
            role = normalize_role(actor_role)
            conflicts = repo.get_conflicting_for_update(
                space_id=reservation_data.id_espacio,
                fecha_reserva=reservation_data.fecha,
                hora_inicio=reservation_data.hora_inicio,
                hora_fin=reservation_data.hora_fin,
            )

            if conflicts:
                if not can_override_client_reservation(role):
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="La franja horaria ya está ocupada",
                    )

                for conflict in conflicts:
                    owner = user_repo.get_by_id(conflict.id_user)
                    owner_role = normalize_role(owner.rol_rel.rol if owner and owner.rol_rel else ROLE_CLIENTE)
                    if owner_role != ROLE_CLIENTE:
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail="No se puede sobrescribir una reserva de ADMIN o CLUB",
                        )

                    conflict.estado = "Cancelada"
                    NotificationService.create_notification(
                        db=db,
                        user_id=conflict.id_user,
                        tipo="RESERVA_CANCELADA",
                        mensaje=(
                            "Tu reserva fue cancelada por una sobrescritura de disponibilidad "
                            f"({role})."
                        ),
                        id_reserva=conflict.id,
                    )

            reserva_dict = reservation_data.dict()
            reserva_dict["estado"] = ReservationService._compute_status(
                reserva_dict["fecha"],
                reserva_dict["hora_inicio"],
                reserva_dict["hora_fin"],
            )
            new_reservation = Reserva(**reserva_dict)
            created_reservation = repo.create(new_reservation)
            db.commit()
            db.refresh(created_reservation)
            return created_reservation
        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al crear la reserva: {str(e)}",
            )

    @staticmethod
    def update_reservation(reservation_id: int, reservation_data: ReservationUpdate, db: Session) -> ReservationResponse:
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

            reservation.estado = ReservationService._compute_status(
                reservation.fecha,
                reservation.hora_inicio,
                reservation.hora_fin,
            )

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
