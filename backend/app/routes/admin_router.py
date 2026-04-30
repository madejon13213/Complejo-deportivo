from typing import Any, Dict

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.auth import AuthManager
from app.database import get_db
from app.logger.logger_config import logger
from app.schemas.penalty_schema import PenaltyResponse
from app.schemas.reservation_schema import ReservationResponse
from app.services.penalty_service import PenaltyService
from app.services.reservation_service import ReservationService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users/{user_id}/reservations", response_model=list[ReservationResponse], status_code=status.HTTP_200_OK)
def get_user_reservations_admin(
    user_id: int,
    current_admin: Dict[str, Any] = Depends(AuthManager.get_current_admin),
    db: Session = Depends(get_db),
):
    logger.info(
        "[admin_router.get_user_reservations_admin] admin_id=%s target_user_id=%s",
        current_admin.get("id") or current_admin.get("sub"),
        user_id,
    )
    return ReservationService.get_user_reservations(user_id, db)


@router.get("/users/{user_id}/penalties", response_model=list[PenaltyResponse], status_code=status.HTTP_200_OK)
def get_user_penalties_admin(
    user_id: int,
    current_admin: Dict[str, Any] = Depends(AuthManager.get_current_admin),
    db: Session = Depends(get_db),
):
    logger.info(
        "[admin_router.get_user_penalties_admin] admin_id=%s target_user_id=%s",
        current_admin.get("id") or current_admin.get("sub"),
        user_id,
    )
    return PenaltyService.get_penalties_by_user(user_id, db)
