from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.slika import Slika
from app.models.korisnik import Korisnik
from app.schemas.slika import SlikaCreate, SlikaUpdate, SlikaResponse
from app.utils.dependencies import get_current_admin
from app.services import artic_service

router = APIRouter(prefix="/api/slike", tags=["Slike"])


@router.get("/", response_model=List[SlikaResponse])
async def list_slike(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    istaknuta: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Slika)
    
    if istaknuta is not None:
        query = query.filter(Slika.istaknuta == istaknuta)
    
    slike = query.order_by(Slika.redosled).offset(skip).limit(limit).all()
    return slike


@router.get("/artic")
async def list_artic_artworks(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    search: Optional[str] = None
):
    data = await artic_service.fetch_artworks(page=page, limit=limit, search=search)
    
    artworks = []
    for artwork in data.get("data", []):
        image_id = artwork.get("image_id")
        if image_id:
            artworks.append({
                "id": artwork.get("id"),
                "naslov": artwork.get("title", "Bez naslova"),
                "fotograf": artwork.get("artist_display", "Nepoznat umetnik"),
                "opis": artwork.get("description", ""),
                "slika": artic_service.get_image_url(image_id),
                "thumbnail": artic_service.get_thumbnail_url(image_id)
            })
    
    return {
        "items": artworks,
        "pagination": data.get("pagination", {})
    }


@router.get("/{slika_id}", response_model=SlikaResponse)
async def get_slika(
    slika_id: int,
    db: Session = Depends(get_db)
):
    slika = db.query(Slika).filter(Slika.id_slika == slika_id).first()
    
    if not slika:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slika nije pronađena"
        )
    
    return slika


@router.post("/", response_model=SlikaResponse, status_code=status.HTTP_201_CREATED)
async def create_slika(
    slika: SlikaCreate,
    db: Session = Depends(get_db),
    current_user: Korisnik = Depends(get_current_admin)
):
    db_slika = Slika(**slika.model_dump())
    
    db.add(db_slika)
    db.commit()
    db.refresh(db_slika)
    
    return db_slika


@router.post("/from-artic", response_model=SlikaResponse, status_code=status.HTTP_201_CREATED)
async def create_slika_from_artic(
    artwork_id: int,
    db: Session = Depends(get_db),
    current_user: Korisnik = Depends(get_current_admin)
):
    artwork = await artic_service.get_artwork_by_id(artwork_id)
    
    if not artwork:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Umetnički rad nije pronađen na Artic API"
        )
    
    slika_data = artic_service.format_artwork_to_slika(artwork)
    db_slika = Slika(**slika_data)
    
    db.add(db_slika)
    db.commit()
    db.refresh(db_slika)
    
    return db_slika


@router.put("/{slika_id}", response_model=SlikaResponse)
async def update_slika(
    slika_id: int,
    slika_update: SlikaUpdate,
    db: Session = Depends(get_db),
    current_user: Korisnik = Depends(get_current_admin)
):
    slika = db.query(Slika).filter(Slika.id_slika == slika_id).first()
    
    if not slika:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slika nije pronađena"
        )
    
    update_data = slika_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(slika, field, value)
    
    db.commit()
    db.refresh(slika)
    
    return slika


@router.delete("/{slika_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_slika(
    slika_id: int,
    db: Session = Depends(get_db),
    current_user: Korisnik = Depends(get_current_admin)
):
    slika = db.query(Slika).filter(Slika.id_slika == slika_id).first()
    
    if not slika:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slika nije pronađena"
        )
    
    db.delete(slika)
    db.commit()
    
    return None
