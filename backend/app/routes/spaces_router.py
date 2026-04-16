from fastapi import APIRouter, Depends, Response, status, Request, HTTPException, Cookie
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional  
from app.database import get_db
from app.auth.auth import AuthManager
from app.schemas.spaces_schema import SpaceResponse
from app.services.spaces_service import SpaceService

router = APIRouter(prefix="/spaces", tags=["Espacios"])

@router.get("/getAll", response_model=list[SpaceResponse])
def get_all_spaces(db: Session = Depends(get_db)):
    return SpaceService.get_all_spaces(db)
