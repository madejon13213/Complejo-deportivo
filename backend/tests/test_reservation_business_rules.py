from datetime import date, datetime, time

from app.services.reservation_service import ReservationService
from app.utils.roles import can_override_client_reservation, normalize_role


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
