from fastapi import APIRouter, Depends, Response, status, Request, HTTPException, Cookie
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional  
from app.database import get_db
from app.schemas.reservation_schema import ReservationResponse
from app.services.reservation_service import ReservationService
from app.auth.auth import AuthManager

router = APIRouter(prefix="/reservations", tags=["Reservas"])

@router.get("/getAll", response_model=list[ReservationResponse], status_code=status.HTTP_200_OK)
def get_all_reservations(
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db)
):  
    return ReservationService.get_all_reservations(db)