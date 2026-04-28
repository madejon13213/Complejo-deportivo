from typing import Any, Dict

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.auth import AuthManager
from app.database import get_db
from app.logger.logger_config import logger
from app.schemas.notification_schema import NotificationMarkReadRequest, NotificationResponse
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notificaciones"])


@router.get("/unread", response_model=list[NotificationResponse], status_code=status.HTTP_200_OK)
def get_unread_notifications(
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db),
):
    user_id = int(current_user.get("id") or current_user.get("sub"))
    logger.info("[notification_router.get_unread_notifications] user_id=%s", user_id)
    return NotificationService.get_unread_notifications(db=db, user_id=user_id)


@router.post("/mark-read", response_model=NotificationResponse, status_code=status.HTTP_200_OK)
def mark_notification_read(
    payload: NotificationMarkReadRequest,
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db),
):
    user_id = int(current_user.get("id") or current_user.get("sub"))
    logger.info(
        "[notification_router.mark_notification_read] user_id=%s notification_id=%s",
        user_id,
        payload.notification_id,
    )
    return NotificationService.mark_notification_as_read(
        db=db,
        user_id=user_id,
        notification_id=payload.notification_id,
    )