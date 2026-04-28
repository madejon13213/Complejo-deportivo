from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.logger.logger_config import logger
from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification_schema import NotificationResponse
from app.tables.tables import Notificacion


class NotificationService:
    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        tipo: str,
        mensaje: str,
        id_reserva: int | None = None,
    ) -> Notificacion:
        repo = NotificationRepository(db)
        logger.info(
            "[NotificationService.create_notification] user_id=%s tipo=%s id_reserva=%s",
            user_id,
            tipo,
            id_reserva,
        )
        notification = Notificacion(
            id_user=user_id,
            tipo=tipo,
            mensaje=mensaje,
            leida=False,
            id_reserva=id_reserva,
        )
        return repo.create(notification)

    @staticmethod
    def get_unread_notifications(db: Session, user_id: int) -> list[NotificationResponse]:
        repo = NotificationRepository(db)
        try:
            notifications = repo.get_unread_by_user(user_id)
            logger.info(
                "[NotificationService.get_unread_notifications] user_id=%s total=%s",
                user_id,
                len(notifications),
            )
            return notifications
        except Exception:
            logger.exception(
                "[NotificationService.get_unread_notifications] error user_id=%s",
                user_id,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudieron recuperar las notificaciones",
            )

    @staticmethod
    def mark_notification_as_read(db: Session, user_id: int, notification_id: int) -> NotificationResponse:
        repo = NotificationRepository(db)
        try:
            logger.info(
                "[NotificationService.mark_notification_as_read] user_id=%s notification_id=%s",
                user_id,
                notification_id,
            )
            notification = repo.mark_as_read(notification_id=notification_id, user_id=user_id)
            if not notification:
                logger.warning(
                    "[NotificationService.mark_notification_as_read] not found user_id=%s notification_id=%s",
                    user_id,
                    notification_id,
                )
                raise HTTPException(status_code=404, detail="Notificación no encontrada")

            db.commit()
            db.refresh(notification)
            return notification
        except HTTPException:
            raise
        except Exception:
            db.rollback()
            logger.exception(
                "[NotificationService.mark_notification_as_read] error user_id=%s notification_id=%s",
                user_id,
                notification_id,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo marcar la notificación como leída",
            )