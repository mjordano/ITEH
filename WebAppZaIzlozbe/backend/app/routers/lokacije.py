from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.lokacija import Lokacija
from app.models.korisnik import Korisnik
from app.schemas.lokacija import LokacijaCreate, LokacijaUpdate, LokacijaResponse
from app.utils.dependencies import get_current_admin

router = APIRouter(prefix="/api/lokacije", tags=["Lokacije"])


@router.get("/", response_model=List[LokacijaResponse])
async def list_lokacije(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    grad: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Lokacija)
    
    if grad:
        query = query.filter(Lokacija.grad.ilike(f"%{grad}%"))
    
    lokacije = query.offset(skip).limit(limit).all()
    return lokacije


@router.get("/{lokacija_id}", response_model=LokacijaResponse)
async def get_lokacija(
    lokacija_id: int,
    db: Session = Depends(get_db)
):
    lokacija = db.query(Lokacija).filter(
        Lokacija.id_lokacija == lokacija_id
    ).first()
    
    if not lokacija:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lokacija nije pronađena"
        )
    
    return lokacija


@router.post("/", response_model=LokacijaResponse, status_code=status.HTTP_201_CREATED)
async def create_lokacija(
    lokacija: LokacijaCreate,
    db: Session = Depends(get_db),
    current_user: Korisnik = Depends(get_current_admin)
):
    db_lokacija = Lokacija(**lokacija.model_dump())
    
    db.add(db_lokacija)
    db.commit()
    db.refresh(db_lokacija)
    
    return db_lokacija


@router.put("/{lokacija_id}", response_model=LokacijaResponse)
async def update_lokacija(
    lokacija_id: int,
    lokacija_update: LokacijaUpdate,
    db: Session = Depends(get_db),
    current_user: Korisnik = Depends(get_current_admin)
):
    lokacija = db.query(Lokacija).filter(
        Lokacija.id_lokacija == lokacija_id
    ).first()
    
    if not lokacija:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lokacija nije pronađena"
        )
    
    update_data = lokacija_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(lokacija, field, value)
    
    db.commit()
    db.refresh(lokacija)
    
    return lokacija


@router.delete("/{lokacija_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lokacija(
    lokacija_id: int,
    db: Session = Depends(get_db),
    current_user: Korisnik = Depends(get_current_admin)
):
    lokacija = db.query(Lokacija).filter(
        Lokacija.id_lokacija == lokacija_id
    ).first()
    
    if not lokacija:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lokacija nije pronađena"
        )
    
    if lokacija.izlozbe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ne možete obrisati lokaciju koja ima izložbe"
        )
    
    db.delete(lokacija)
    db.commit()
    
    return None
