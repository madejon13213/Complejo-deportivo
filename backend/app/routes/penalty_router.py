from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import Dict, Any 
from app.database import get_db
from app.auth.auth import AuthManager
from app.schemas.penalty_schema import PenaltyResponse
from app.services.penalty_service import PenaltyService

router = APIRouter(prefix="/penalties", tags=["Penalizaciones"])


@router.get("/getAll", response_model=list[PenaltyResponse], status_code=status.HTTP_200_OK)
def get_all_penalties(
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db)
):  
    return PenaltyService.get_all_penalties(db)

@router.get("/{id}", response_model=PenaltyResponse, status_code=status.HTTP_200_OK)
def get_penalty_by_id(
    id: int,
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db)
):
    return PenaltyService.get_penalty_by_id(id, db)

@router.get("/user/{id}", response_model=list[PenaltyResponse], status_code=status.HTTP_200_OK)
def get_penalties_by_user(
    id: int,
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db)
):
    return PenaltyService.get_penalties_by_user(id, db)

@router.get("/reservation/{id}", response_model=PenaltyResponse, status_code=status.HTTP_200_OK)
def get_penalty_by_reservation(
    id: int,
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db)
):
    return PenaltyService.get_penalty_by_reservation(id, db)
    