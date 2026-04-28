from typing import Any

ROLE_ADMIN = "ADMIN"
ROLE_CLUB = "CLUB"
ROLE_CLIENTE = "CLIENTE"


def normalize_role(value: Any) -> str:
    if value is None:
        return ROLE_CLIENTE

    raw = str(value).strip().upper()
    mapping = {
        "ADMIN": ROLE_ADMIN,
        "ADMINISTRADOR": ROLE_ADMIN,
        "CLUB": ROLE_CLUB,
        "CLIENTE": ROLE_CLIENTE,
    }
    return mapping.get(raw, ROLE_CLIENTE)


def role_from_payload(payload: dict) -> str:
    if payload.get("rol"):
        return normalize_role(payload.get("rol"))
    if payload.get("role"):
        return normalize_role(payload.get("role"))
    return ROLE_CLIENTE


def can_override_client_reservation(role: str) -> bool:
    normalized = normalize_role(role)
    return normalized in {ROLE_ADMIN, ROLE_CLUB}
