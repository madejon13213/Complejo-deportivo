from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

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
            return penalties
        except Exception:
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
                raise HTTPException(status_code=404, detail="Reserva no encontrada")

            existing = penalty_repo.get_by_reservation(payload.id_reserva)
            if existing:
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
            return created
        except HTTPException:
            raise
        except Exception:
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
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al obtener penalización",
            )

    @staticmethod
    def get_penalties_by_user(id_user: int, db: Session):
        repo = PenaltyRepository(db)
        try:
            penalties = repo.get_by_user(id_user)
            return penalties
        except Exception:
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
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al obtener penalización",
            )
