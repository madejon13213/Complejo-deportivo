from fastapi import APIRouter, Depends, Response, status, Request, HTTPException, Cookie
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional  
from app.schemas.court_schema import CourtResponse
from app.database import get_db
from app.auth.auth import AuthManager
from app.services.court_service import CourtService

router = APIRouter(prefix="/courts", tags=["Pistas"])

@router.get("/getAll", response_model=list[CourtResponse], status_code=status.HTTP_200_OK)
def get_all_courts(
    current_user: Dict[str, Any] = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db)
):  
    return CourtService.get_all_courts(db)

