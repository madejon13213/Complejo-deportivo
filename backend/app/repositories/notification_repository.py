from app.repositories.base_repository import BaseRepository
from app.tables.tables import Notificacion


class NotificationRepository(BaseRepository):
    def create(self, notification: Notificacion) -> Notificacion:
        self.db.add(notification)
        self.db.flush()
        return notification

    def get_unread_by_user(self, user_id: int) -> list[Notificacion]:
        return (
            self.db.query(Notificacion)
            .filter(Notificacion.id_user == user_id, Notificacion.leida.is_(False))
            .order_by(Notificacion.creada_en.desc(), Notificacion.id.desc())
            .all()
        )

    def get_by_user(self, user_id: int, limit: int = 25) -> list[Notificacion]:
        return (
            self.db.query(Notificacion)
            .filter(Notificacion.id_user == user_id)
            .order_by(Notificacion.creada_en.desc(), Notificacion.id.desc())
            .limit(limit)
            .all()
        )

    def mark_as_read(self, notification_id: int, user_id: int) -> Notificacion | None:
        notification = (
            self.db.query(Notificacion)
            .filter(Notificacion.id == notification_id, Notificacion.id_user == user_id)
            .first()
        )
        if not notification:
            return None

        notification.leida = True
        self.db.add(notification)
        self.db.flush()
        return notification