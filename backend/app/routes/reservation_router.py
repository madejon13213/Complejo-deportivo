from datetime import date
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.auth.auth import AuthManager
from app.database import get_db
from app.schemas.reservation_schema import (
    ReservationCreate,
    ReservationResponse,
    ReservationSearchResponse,
    ReservationUpdate,
)
from app.services.reservation_service import ReservationService

router = APIRouter(prefix="/reservations", tags=["Reservas"])


@router.get("/getAll", response_model=list[ReservationResponse], status_code=status.HTTP_200_OK)
def get_all_reservations(
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db),
):
    return ReservationService.get_all_reservations(db)


@router.get("/search", response_model=ReservationSearchResponse, status_code=status.HTTP_200_OK)
def search_reservations(
    fecha: Optional[date] = Query(default=None),
    usuario: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db),
):
    return ReservationService.get_filtered_reservations(
        db=db,
        fecha=fecha,
        usuario=usuario,
        page=page,
        limit=limit,
    )


@router.get("/active", response_model=list[ReservationResponse], status_code=status.HTTP_200_OK)
def get_active_reservations(
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db),
):
    return ReservationService.get_active_reservations(db)


@router.get("/user/{id}", response_model=list[ReservationResponse], status_code=status.HTTP_200_OK)
def get_user_reservations(
    id: int,
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db),
):
    return ReservationService.get_user_reservations(id, db)


@router.get("/space/{id}", response_model=list[ReservationResponse], status_code=status.HTTP_200_OK)
def get_space_reservations(
    id: int,
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db),
):
    return ReservationService.get_space_reservations(id, db)


@router.post("/create", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
def create_reservation(
    reservation_data: ReservationCreate,
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db),
):
    return ReservationService.create_reservation(
        reservation_data=reservation_data,
        db=db,
        actor_role=current_user.get("rol", "CLIENTE"),
    )


@router.put("/update/{id}", response_model=ReservationResponse, status_code=status.HTTP_200_OK)
def update_reservation(
    id: int,
    reservation_data: ReservationUpdate,
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db),
):
    return ReservationService.update_reservation(id, reservation_data, db)


@router.delete("/delete/{id}", status_code=status.HTTP_200_OK)
def delete_reservation(
    id: int,
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db),
):
    return ReservationService.delete_reservation(id, db)


@router.get("/{id}", response_model=ReservationResponse, status_code=status.HTTP_200_OK)
def get_reservation_by_id(
    id: int,
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db),
):
    return ReservationService.get_reservation_by_id(id, db)
