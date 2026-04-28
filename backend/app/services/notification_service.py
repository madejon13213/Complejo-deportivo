from fastapi import HTTPException, status
from sqlalchemy.orm import Session

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
            return repo.get_unread_by_user(user_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudieron recuperar las notificaciones",
            )

    @staticmethod
    def mark_notification_as_read(db: Session, user_id: int, notification_id: int) -> NotificationResponse:
        repo = NotificationRepository(db)
        try:
            notification = repo.mark_as_read(notification_id=notification_id, user_id=user_id)
            if not notification:
                raise HTTPException(status_code=404, detail="Notificación no encontrada")

            db.commit()
            db.refresh(notification)
            return notification
        except HTTPException:
            raise
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo marcar la notificación como leída",
            )
