from fastapi import APIRouter, Depends, Query, Response, status, Request, HTTPException, Cookie
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional  
from app.database import get_db
from app.auth.auth import AuthManager
from app.schemas.spaces_schema import SpaceResponse, SpaceSearchResponse
from app.services.spaces_service import SpaceService

router = APIRouter(prefix="/spaces", tags=["Espacios"])

@router.get("/getAll", response_model=SpaceSearchResponse, status_code=status.HTTP_200_OK)
def get_all_spaces(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1),
    db: Session = Depends(get_db)
):
    return SpaceService.get_all_spaces(db, page, limit)
@router.get("/types", response_model=list[SpaceResponse], status_code=status.HTTP_200_OK)
def get_all_types(
    db: Session = Depends(get_db)
):
    return SpaceService.get_all_types(db)
