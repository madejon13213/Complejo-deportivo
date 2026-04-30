from datetime import date, datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.logger.logger_config import logger
from app.repositories.penalty_repository import PenaltyRepository
from app.repositories.reservation_repository import ReservationRepository
from app.schemas.penalty_schema import PenaltyCreate
from app.tables.tables import Penalizacion


class PenaltyService:
    @staticmethod
    def get_all_penalties(db: Session):
        repo = PenaltyRepository(db)
        try:
            penalties = repo.get_all()
            logger.info("[PenaltyService.get_all_penalties] total=%s", len(penalties))
            return penalties
        except Exception:
            logger.exception("[PenaltyService.get_all_penalties] error")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al obtener penalizaciones",
            )

    @staticmethod
    def create_penalty(payload: PenaltyCreate, admin_user: dict, db: Session):
        penalty_repo = PenaltyRepository(db)
        reservation_repo = ReservationRepository(db)

        try:
            reservation = reservation_repo.get_by_id(payload.id_reserva)
            if not reservation:
                logger.warning("[PenaltyService.create_penalty] reservation not found id_reserva=%s", payload.id_reserva)
                raise HTTPException(status_code=404, detail="Reserva no encontrada")

            reservation_end = datetime.combine(reservation.fecha, reservation.hora_fin)
            if reservation_end > datetime.now():
                logger.warning(
                    "[PenaltyService.create_penalty] blocked future reservation id_reserva=%s end=%s",
                    payload.id_reserva,
                    reservation_end,
                )
                raise HTTPException(status_code=400, detail="Solo se puede penalizar una reserva ya finalizada")

            existing = penalty_repo.get_by_reservation(payload.id_reserva)
            if existing:
                logger.warning("[PenaltyService.create_penalty] duplicated penalty id_reserva=%s", payload.id_reserva)
                raise HTTPException(status_code=409, detail="La reserva ya tiene una penalizacion")

            fecha_penalizacion = payload.fecha_penalizacion or date.today()
            admin_id = admin_user.get("id") or admin_user.get("sub")
            motivo = payload.motivo.strip()
            motivo_guardado = f"{motivo} | admin:{admin_id}"

            created = penalty_repo.create(
                Penalizacion(
                    fecha_inicio=fecha_penalizacion,
                    fecha_fin=fecha_penalizacion,
                    tipo_penalizacion=motivo_guardado,
                    id_reserva=payload.id_reserva,
                )
            )
            db.commit()
            db.refresh(created)
            logger.info("[PenaltyService.create_penalty] created id=%s id_reserva=%s", created.id, payload.id_reserva)
            return created
        except HTTPException:
            db.rollback()
            raise
        except Exception:
            db.rollback()
            logger.exception("[PenaltyService.create_penalty] transactional error id_reserva=%s", payload.id_reserva)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al crear penalizacion",
            )

    @staticmethod
    def get_penalty_by_id(id: int, db: Session):
        repo = PenaltyRepository(db)
        try:
            penalty = repo.get_by_id(id)
            if not penalty:
                raise HTTPException(status_code=404, detail="Penalización no encontrada")
            return penalty
        except HTTPException:
            raise
        except Exception:
            logger.exception("[PenaltyService.get_penalty_by_id] error id=%s", id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al obtener penalización",
            )

    @staticmethod
    def get_penalties_by_user(id_user: int, db: Session):
        repo = PenaltyRepository(db)
        try:
            penalties = repo.get_by_user(id_user)
            logger.info("[PenaltyService.get_penalties_by_user] user_id=%s total=%s", id_user, len(penalties))
            return penalties
        except Exception:
            logger.exception("[PenaltyService.get_penalties_by_user] error user_id=%s", id_user)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al obtener penalizaciones",
            )

    @staticmethod
    def get_penalty_by_reservation(id_reserva: int, db: Session):
        repo = PenaltyRepository(db)
        try:
            penalty = repo.get_by_reservation(id_reserva)
            if not penalty:
                raise HTTPException(status_code=404, detail="Penalización no encontrada")
            return penalty
        except HTTPException:
            raise
        except Exception:
            logger.exception("[PenaltyService.get_penalty_by_reservation] error id_reserva=%s", id_reserva)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al obtener penalización",
            )
