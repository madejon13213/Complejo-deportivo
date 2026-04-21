from fastapi import APIRouter, Depends, Response, status, Request, HTTPException, Cookie
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional  
from app.database import get_db
from app.schemas.reservation_schema import ReservationResponse, ReservationCreate, ReservationUpdate
from app.services.reservation_service import ReservationService
from app.auth.auth import AuthManager

router = APIRouter(prefix="/reservations", tags=["Reservas"])

@router.get("/getAll", response_model=list[ReservationResponse], status_code=status.HTTP_200_OK)
def get_all_reservations(
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db)
):  
    return ReservationService.get_all_reservations(db)

@router.get("/active", response_model=list[ReservationResponse], status_code=status.HTTP_200_OK)
def get_active_reservations(
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db)
):
    return ReservationService.get_active_reservations(db)

@router.get("/{id}", response_model=ReservationResponse, status_code=status.HTTP_200_OK)
def get_reservation_by_id(
    id: int,
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db)
):
    return ReservationService.get_reservation_by_id(id, db)

@router.get("/user/{id}", response_model=list[ReservationResponse], status_code=status.HTTP_200_OK)
def get_user_reservations(
    id: int,
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db)
):
    return ReservationService.get_user_reservations(id, db)

@router.get("/space/{id}", response_model=list[ReservationResponse], status_code=status.HTTP_200_OK)
def get_space_reservations(
    id: int,
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db)
):
    return ReservationService.get_space_reservations(id, db)



@router.post("/create", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
def create_reservation(
    reservation_data: ReservationCreate,
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db)
):
    return ReservationService.create_reservation(reservation_data, db)

@router.put("/update/{id}", response_model=ReservationResponse, status_code=status.HTTP_200_OK)
def update_reservation(
    id: int,
    reservation_data: ReservationUpdate,
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db)
):
    return ReservationService.update_reservation(id, reservation_data, db)

@router.delete("/delete/{id}", status_code=status.HTTP_200_OK)
def delete_reservation(
    id: int,
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db)
):
    return ReservationService.delete_reservation(id, db)
