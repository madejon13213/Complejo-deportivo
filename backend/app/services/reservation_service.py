from datetime import date, datetime
from math import ceil
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.logger.logger_config import logger
from app.repositories.court_repository import CourtRepository
from app.repositories.reservation_repository import ReservationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.reservation_schema import (
    ReservationCreate,
    ReservationResponse,
    ReservationSearchItem,
    ReservationSearchResponse,
    ReservationUpdate,
    ReservationEstimateRequest,
    ReservationEstimateResponse,
)
from app.services.notification_service import NotificationService
from app.tables.tables import Espacio, Reserva
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
    def _reservation_start_datetime(reservation: Reserva) -> datetime:
        return datetime.combine(reservation.fecha, reservation.hora_inicio)

    @staticmethod
    def _duration_hours(hora_inicio, hora_fin) -> float:
        start_minutes = hora_inicio.hour * 60 + hora_inicio.minute
        end_minutes = hora_fin.hour * 60 + hora_fin.minute
        return max(0.0, (end_minutes - start_minutes) / 60)

    @staticmethod
    def _uses_partial(reservation: Reserva) -> bool:
        return reservation.tipo_reserva.lower() == "parcial"

    @staticmethod
    def _reservation_units(reservation: Reserva, space_capacity: int, allows_partial: bool) -> int:
        if allows_partial and ReservationService._uses_partial(reservation):
            return max(1, int(reservation.plazas_parciales or 1))
        return max(1, int(space_capacity))

    @staticmethod
    def _calculate_total_price(reservation: Reserva, space: Espacio, allows_partial: bool) -> float:
        duration = ReservationService._duration_hours(reservation.hora_inicio, reservation.hora_fin)
        if allows_partial and ReservationService._uses_partial(reservation):
            unit_price = float(space.precio_hora) / max(1, int(space.capacidad))
            units = max(1, int(reservation.plazas_parciales or 1))
            return round(duration * unit_price * units, 2)

        return round(duration * float(space.precio_hora), 2)

    @staticmethod
    def _to_response(reservation: Reserva, space: Espacio, allows_partial: bool) -> ReservationResponse:
        return ReservationResponse(
            id=reservation.id,
            fecha=reservation.fecha,
            hora_inicio=reservation.hora_inicio,
            hora_fin=reservation.hora_fin,
            estado=reservation.estado,
            plazas_parciales=reservation.plazas_parciales,
            tipo_reserva=reservation.tipo_reserva,
            precio_total=ReservationService._calculate_total_price(reservation, space, allows_partial),
            id_user=reservation.id_user,
            id_espacio=reservation.id_espacio,
        )

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
        court_repo = CourtRepository(db)
        try:
            reservations = repo.get_all()
            ReservationService._refresh_statuses(reservations)
            db.commit()
            logger.info("[ReservationService.get_all_reservations] total=%s", len(reservations))

            result: list[ReservationResponse] = []
            for reservation in reservations:
                space = court_repo.get_by_id(reservation.id_espacio)
                if not space:
                    continue
                allows_partial = bool(getattr(space, "tipo_espacio_rel", None) and space.tipo_espacio_rel.permite_reserva_parcial)
                result.append(ReservationService._to_response(reservation, space, allows_partial))
            return result
        except Exception:
            db.rollback()
            logger.exception("[ReservationService.get_all_reservations] error")
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
        court_repo = CourtRepository(db)
        try:
            rows, total = repo.get_filtered_paginated(fecha=fecha, usuario=usuario, page=page, limit=limit)
            ReservationService._refresh_statuses([reserva for reserva, _ in rows])
            db.commit()

            items: list[ReservationSearchItem] = []
            for reserva, usuario_row in rows:
                space = court_repo.get_by_id(reserva.id_espacio)
                if not space:
                    continue
                allows_partial = bool(getattr(space, "tipo_espacio_rel", None) and space.tipo_espacio_rel.permite_reserva_parcial)
                items.append(
                    ReservationSearchItem(
                        id=reserva.id,
                        fecha=reserva.fecha,
                        hora_inicio=reserva.hora_inicio,
                        hora_fin=reserva.hora_fin,
                        estado=reserva.estado,
                        plazas_parciales=reserva.plazas_parciales,
                        tipo_reserva=reserva.tipo_reserva,
                        precio_total=ReservationService._calculate_total_price(reserva, space, allows_partial),
                        id_user=reserva.id_user,
                        id_espacio=reserva.id_espacio,
                        usuario_nombre=" ".join(
                            [part for part in [usuario_row.nombre, usuario_row.pri_ape, usuario_row.seg_ape] if part]
                        ),
                    )
                )

            total_pages = max(1, ceil(total / limit)) if limit > 0 else 1
            logger.info(
                "[ReservationService.get_filtered_reservations] fecha=%s usuario=%s page=%s limit=%s total=%s",
                fecha,
                usuario,
                page,
                limit,
                total,
            )
            return ReservationSearchResponse(
                items=items,
                total=total,
                page=page,
                limit=limit,
                total_pages=total_pages,
            )
        except Exception:
            db.rollback()
            logger.exception(
                "[ReservationService.get_filtered_reservations] error fecha=%s usuario=%s page=%s limit=%s",
                fecha,
                usuario,
                page,
                limit,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al intentar filtrar reservas",
            )

    @staticmethod
    def get_reservation_by_id(reservation_id: int, db: Session) -> ReservationResponse:
        repo = ReservationRepository(db)
        court_repo = CourtRepository(db)
        try:
            reservation = repo.get_by_id(reservation_id)
            if not reservation:
                logger.warning("[ReservationService.get_reservation_by_id] not found reservation_id=%s", reservation_id)
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Reserva con ID {reservation_id} no encontrada",
                )
            ReservationService._refresh_statuses([reservation])
            db.commit()
            space = court_repo.get_by_id(reservation.id_espacio)
            if not space:
                raise HTTPException(status_code=404, detail="Espacio no encontrado")
            allows_partial = bool(getattr(space, "tipo_espacio_rel", None) and space.tipo_espacio_rel.permite_reserva_parcial)
            logger.info("[ReservationService.get_reservation_by_id] found reservation_id=%s", reservation_id)
            return ReservationService._to_response(reservation, space, allows_partial)
        except HTTPException:
            raise
        except Exception:
            db.rollback()
            logger.exception("[ReservationService.get_reservation_by_id] error reservation_id=%s", reservation_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al intentar recuperar la reserva de la base de datos",
            )

    @staticmethod
    def get_user_reservations(user_id: int, db: Session) -> list[ReservationResponse]:
        repo = ReservationRepository(db)
        court_repo = CourtRepository(db)
        try:
            reservations = repo.get_by_user(user_id)
            ReservationService._refresh_statuses(reservations)
            db.commit()
            logger.info("[ReservationService.get_user_reservations] user_id=%s total=%s", user_id, len(reservations))
            result: list[ReservationResponse] = []
            for reservation in reservations:
                space = court_repo.get_by_id(reservation.id_espacio)
                if not space:
                    continue
                allows_partial = bool(getattr(space, "tipo_espacio_rel", None) and space.tipo_espacio_rel.permite_reserva_parcial)
                result.append(ReservationService._to_response(reservation, space, allows_partial))
            return result
        except Exception:
            db.rollback()
            logger.exception("[ReservationService.get_user_reservations] error user_id=%s", user_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al intentar recuperar las reservas del usuario",
            )

    @staticmethod
    def get_space_reservations(space_id: int, db: Session) -> list[ReservationResponse]:
        repo = ReservationRepository(db)
        court_repo = CourtRepository(db)
        try:
            reservations = repo.get_by_space(space_id)
            ReservationService._refresh_statuses(reservations)
            db.commit()
            logger.info("[ReservationService.get_space_reservations] space_id=%s total=%s", space_id, len(reservations))
            space = court_repo.get_by_id(space_id)
            if not space:
                return []
            allows_partial = bool(getattr(space, "tipo_espacio_rel", None) and space.tipo_espacio_rel.permite_reserva_parcial)
            return [ReservationService._to_response(reservation, space, allows_partial) for reservation in reservations]
        except Exception:
            db.rollback()
            logger.exception("[ReservationService.get_space_reservations] error space_id=%s", space_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al intentar recuperar las reservas del espacio",
            )

    @staticmethod
    def get_active_reservations(db: Session) -> list[ReservationResponse]:
        repo = ReservationRepository(db)
        court_repo = CourtRepository(db)
        try:
            reservations = repo.get_active()
            ReservationService._refresh_statuses(reservations)
            db.commit()
            logger.info("[ReservationService.get_active_reservations] total=%s", len(reservations))
            result: list[ReservationResponse] = []
            for reservation in reservations:
                space = court_repo.get_by_id(reservation.id_espacio)
                if not space:
                    continue
                allows_partial = bool(getattr(space, "tipo_espacio_rel", None) and space.tipo_espacio_rel.permite_reserva_parcial)
                result.append(ReservationService._to_response(reservation, space, allows_partial))
            return result
        except Exception:
            db.rollback()
            logger.exception("[ReservationService.get_active_reservations] error")
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
        court_repo = CourtRepository(db)

        try:
            role = normalize_role(actor_role)
            space = court_repo.get_by_id(reservation_data.id_espacio)
            if not space:
                raise HTTPException(status_code=404, detail="Espacio no encontrado")

            allows_partial = bool(getattr(space, "tipo_espacio_rel", None) and space.tipo_espacio_rel.permite_reserva_parcial)
            capacity = max(1, int(space.capacidad))
            requested_units = reservation_data.plazas_parciales or reservation_data.numero_personas or capacity
            requested_units = max(1, int(requested_units))

            if reservation_data.tipo_reserva.lower() == "parcial":
                if not allows_partial:
                    raise HTTPException(status_code=400, detail="Este espacio no permite reservas parciales")
                if requested_units > capacity:
                    raise HTTPException(status_code=400, detail="Las plazas solicitadas exceden la capacidad del espacio")
            else:
                requested_units = capacity

            logger.info(
                "[ReservationService.create_reservation] start role=%s user_id=%s space_id=%s fecha=%s hora_inicio=%s hora_fin=%s requested_units=%s",
                role,
                reservation_data.id_user,
                reservation_data.id_espacio,
                reservation_data.fecha,
                reservation_data.hora_inicio,
                reservation_data.hora_fin,
                requested_units,
            )

            conflicts = repo.get_conflicting_for_update(
                space_id=reservation_data.id_espacio,
                fecha_reserva=reservation_data.fecha,
                hora_inicio=reservation_data.hora_inicio,
                hora_fin=reservation_data.hora_fin,
            )

            occupied_units = 0
            for conflict in conflicts:
                occupied_units += ReservationService._reservation_units(conflict, capacity, allows_partial)
            available_units = max(0, capacity - occupied_units)

            if requested_units > available_units:
                logger.info(
                    "[ReservationService.create_reservation] insufficient availability requested=%s available=%s",
                    requested_units,
                    available_units,
                )
                if not can_override_client_reservation(role):
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="La franja horaria no tiene disponibilidad suficiente",
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
                            f"Tu reserva en '{space.nombre}' para el día {conflict.fecha} a las {conflict.hora_inicio.strftime('%H:%M')} "
                            f"ha sido cancelada por una sobrescritura de disponibilidad ({role})."
                        ),
                        id_reserva=conflict.id,
                    )

            reserva_dict = reservation_data.dict()
            reserva_dict["estado"] = ReservationService._compute_status(
                reserva_dict["fecha"],
                reserva_dict["hora_inicio"],
                reserva_dict["hora_fin"],
            )
            reserva_dict["plazas_parciales"] = requested_units if reservation_data.tipo_reserva.lower() == "parcial" else None
            reserva_dict.pop("numero_personas", None)

            new_reservation = Reserva(**reserva_dict)
            created_reservation = repo.create(new_reservation)
            db.commit()
            db.refresh(created_reservation)
            logger.info("[ReservationService.create_reservation] created reservation_id=%s", created_reservation.id)
            return ReservationService._to_response(created_reservation, space, allows_partial)
        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            logger.exception("[ReservationService.create_reservation] transactional error: %s", str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al crear la reserva: {str(e)}",
            )

    @staticmethod
    def estimate_price(data: ReservationEstimateRequest, db: Session) -> ReservationEstimateResponse:
        court_repo = CourtRepository(db)
        space = court_repo.get_by_id(data.id_espacio)
        if not space:
            raise HTTPException(status_code=404, detail="Espacio no encontrado")
        
        allows_partial = bool(getattr(space, "tipo_espacio_rel", None) and space.tipo_espacio_rel.permite_reserva_parcial)
        
        class MockReservation:
            hora_inicio = data.hora_inicio
            hora_fin = data.hora_fin
            tipo_reserva = "parcial" if allows_partial else "completa"
            plazas_parciales = data.numero_personas if allows_partial else None
            
        mock_res = MockReservation()
        
        precio_estimado = ReservationService._calculate_total_price(mock_res, space, allows_partial) # type: ignore
        return ReservationEstimateResponse(precio_estimado=precio_estimado)

    @staticmethod
    def update_reservation(reservation_id: int, reservation_data: ReservationUpdate, db: Session) -> ReservationResponse:
        repo = ReservationRepository(db)
        court_repo = CourtRepository(db)
        try:
            reservation = repo.get_by_id(reservation_id)
            if not reservation:
                logger.warning("[ReservationService.update_reservation] not found reservation_id=%s", reservation_id)
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Reserva con ID {reservation_id} no encontrada",
                )

            old_status = reservation.estado
            for field, value in reservation_data.dict().items():
                if value is not None:
                    setattr(reservation, field, value)

            # Si no se mandó un estado explícito, calculamos el nuevo estado según el tiempo.
            # (El método _compute_status nunca retorna 'Cancelada')
            if reservation_data.estado is None:
                reservation.estado = ReservationService._compute_status(
                    reservation.fecha,
                    reservation.hora_inicio,
                    reservation.hora_fin,
                )

            # Notificar si el estado ha cambiado a 'Cancelada'
            if reservation.estado == "Cancelada" and old_status != "Cancelada":
                space = court_repo.get_by_id(reservation.id_espacio)
                space_name = space.nombre if space else "un espacio"
                NotificationService.create_notification(
                    db=db,
                    user_id=reservation.id_user,
                    tipo="RESERVA_CANCELADA",
                    mensaje=f"Tu reserva en '{space_name}' para el día {reservation.fecha} a las {reservation.hora_inicio.strftime('%H:%M')} ha sido cancelada.",
                    id_reserva=reservation.id,
                )

            updated_reservation = repo.update(reservation)
            db.commit()
            db.refresh(updated_reservation)
            space = court_repo.get_by_id(updated_reservation.id_espacio)
            if not space:
                raise HTTPException(status_code=404, detail="Espacio no encontrado")
            allows_partial = bool(getattr(space, "tipo_espacio_rel", None) and space.tipo_espacio_rel.permite_reserva_parcial)
            logger.info("[ReservationService.update_reservation] updated reservation_id=%s", reservation_id)
            return ReservationService._to_response(updated_reservation, space, allows_partial)
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.exception("[ReservationService.update_reservation] transactional error reservation_id=%s", reservation_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al actualizar la reserva: {str(e)}",
            )

    @staticmethod
    def delete_reservation(reservation_id: int, db: Session) -> dict:
        repo = ReservationRepository(db)
        court_repo = CourtRepository(db)
        try:
            pending_new = len(db.new)
            pending_dirty = len(db.dirty)
            if pending_new or pending_dirty:
                logger.warning(
                    "[ReservationService.delete_reservation] pending session state before delete reservation_id=%s new=%s dirty=%s; rollback to clean",
                    reservation_id,
                    pending_new,
                    pending_dirty,
                )
                db.rollback()

            reservation = repo.get_by_id(reservation_id)
            if not reservation:
                logger.warning("[ReservationService.delete_reservation] not found reservation_id=%s", reservation_id)
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Reserva con ID {reservation_id} no encontrada",
                )

            reservation_start = ReservationService._reservation_start_datetime(reservation)
            if reservation_start <= datetime.now():
                logger.warning(
                    "[ReservationService.delete_reservation] blocked past reservation_id=%s start=%s",
                    reservation_id,
                    reservation_start,
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No se puede cancelar una reserva que ya ha comenzado o ha pasado",
                )

            # Enviar notificación de cancelación antes de borrar
            space = court_repo.get_by_id(reservation.id_espacio)
            space_name = space.nombre if space else "un espacio"
            NotificationService.create_notification(
                db=db,
                user_id=reservation.id_user,
                tipo="RESERVA_CANCELADA",
                mensaje=f"Tu reserva en '{space_name}' para el día {reservation.fecha} a las {reservation.hora_inicio.strftime('%H:%M')} ha sido cancelada.",
                id_reserva=None, # Ponemos None porque la reserva va a ser eliminada físicamente
            )

            deleted = repo.delete_by_id(reservation_id)
            if deleted:
                db.commit()
                logger.info("[ReservationService.delete_reservation] deleted reservation_id=%s", reservation_id)
                return {"message": f"Reserva con ID {reservation_id} eliminada exitosamente"}

            logger.error("[ReservationService.delete_reservation] delete_by_id returned false reservation_id=%s", reservation_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo eliminar la reserva",
            )
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.exception("[ReservationService.delete_reservation] transactional error reservation_id=%s", reservation_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al eliminar la reserva: {str(e)}",
            )
