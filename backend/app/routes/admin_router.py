from typing import Any, Dict

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.auth.auth import AuthManager
from app.database import get_db
from app.logger.logger_config import logger
from app.schemas.penalty_schema import PenaltyResponse
from app.schemas.reservation_schema import ReservationResponse
from app.services.penalty_service import PenaltyService
from app.services.reservation_service import ReservationService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users/{user_id}/reservations", status_code=status.HTTP_200_OK)
def get_user_reservations_admin(
    user_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1),
    current_admin: Dict[str, Any] = Depends(AuthManager.get_current_admin),
    db: Session = Depends(get_db),
):
    logger.info(
        "[admin_router.get_user_reservations_admin] admin_id=%s target_user_id=%s page=%s limit=%s",
        current_admin.get("id") or current_admin.get("sub"),
        user_id,
        page,
        limit,
    )
    return ReservationService.get_user_reservations_paginated(user_id, db, page, limit)


@router.get("/users/{user_id}/penalties", status_code=status.HTTP_200_OK)
def get_user_penalties_admin(
    user_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1),
    current_admin: Dict[str, Any] = Depends(AuthManager.get_current_admin),
    db: Session = Depends(get_db),
):
    logger.info(
        "[admin_router.get_user_penalties_admin] admin_id=%s target_user_id=%s page=%s limit=%s",
        current_admin.get("id") or current_admin.get("sub"),
        user_id,
        page,
        limit,
    )
    return PenaltyService.get_penalties_by_user_paginated(user_id, db, page, limit)
