from datetime import date, datetime, time

from app.services.reservation_service import ReservationService
from app.utils.roles import can_override_client_reservation, normalize_role


class DummyReservation:
    def __init__(self):
        self.id = 10
        self.id_user = 22
        self.id_espacio = 1
        self.fecha = date.today()
        self.hora_inicio = time(10, 0)
        self.hora_fin = time(11, 0)
        self.estado = "Pendiente"
        self.plazas_parciales = None
        self.tipo_reserva = "completa"


class DummyRole:
    def __init__(self, rol):
        self.rol = rol


class DummyUser:
    def __init__(self, rol):
        self.rol_rel = DummyRole(rol)


class DummyDB:
    def __init__(self):
        self.committed = False
        self.rolled_back = False

    def commit(self):
        self.committed = True

    def rollback(self):
        self.rolled_back = True

    def refresh(self, _obj):
        return None


def test_role_normalization_and_override_permissions():
    assert normalize_role("administrador") == "ADMIN"
    assert normalize_role("admin") == "ADMIN"
    assert normalize_role("club") == "CLUB"
    assert normalize_role("cliente") == "CLIENTE"

    assert can_override_client_reservation("ADMIN") is True
    assert can_override_client_reservation("CLUB") is True
    assert can_override_client_reservation("CLIENTE") is False


def test_reservation_status_pending_future_day():
    tomorrow = date.fromordinal(date.today().toordinal() + 1)
    status_value = ReservationService._compute_status(
        fecha=tomorrow,
        hora_inicio=time(10, 0),
        hora_fin=time(11, 0),
    )
    assert status_value == "Pendiente"


def test_reservation_status_finalized_past_day():
    yesterday = date.fromordinal(date.today().toordinal() - 1)
    status_value = ReservationService._compute_status(
        fecha=yesterday,
        hora_inicio=time(10, 0),
        hora_fin=time(11, 0),
    )
    assert status_value == "Finalizada"


def test_reservation_status_in_progress_when_inside_time_range(monkeypatch):
    class FrozenDateTime(datetime):
        @classmethod
        def now(cls, tz=None):
            return cls.combine(date.today(), time(10, 30))

    monkeypatch.setattr("app.services.reservation_service.datetime", FrozenDateTime)

    status_value = ReservationService._compute_status(
        fecha=date.today(),
        hora_inicio=time(10, 0),
        hora_fin=time(11, 0),
    )
    assert status_value == "En curso"


def test_admin_can_override_client_reservation_and_emit_notification(monkeypatch):
    db = DummyDB()
    conflict = DummyReservation()

    class FakeReservationRepo:
        def get_conflicting_for_update(self, **kwargs):
            return [conflict]

        def create(self, reserva):
            reserva.id = 999
            return reserva

    class FakeUserRepo:
        def get_by_id(self, _user_id):
            return DummyUser("CLIENTE")

    notifications = []

    def fake_notification_create(**kwargs):
        notifications.append(kwargs)

    class Payload:
        fecha = date.today()
        hora_inicio = time(12, 0)
        hora_fin = time(13, 0)
        tipo_reserva = "completa"
        plazas_parciales = None
        id_user = 1
        id_espacio = 1

        def dict(self):
            return {
                "fecha": self.fecha,
                "hora_inicio": self.hora_inicio,
                "hora_fin": self.hora_fin,
                "tipo_reserva": self.tipo_reserva,
                "plazas_parciales": self.plazas_parciales,
                "id_user": self.id_user,
                "id_espacio": self.id_espacio,
            }

    monkeypatch.setattr("app.services.reservation_service.ReservationRepository", lambda _db: FakeReservationRepo())
    monkeypatch.setattr("app.services.reservation_service.UserRepository", lambda _db: FakeUserRepo())
    monkeypatch.setattr("app.services.reservation_service.NotificationService.create_notification", fake_notification_create)

    created = ReservationService.create_reservation(Payload(), db, actor_role="ADMIN")

    assert created.id == 999
    assert conflict.estado == "Cancelada"
    assert len(notifications) == 1
    assert notifications[0]["user_id"] == conflict.id_user
    assert db.committed is True
