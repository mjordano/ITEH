"""
Korisnici Router - Upravljanje korisnicima
CRUD operacije za korisnike (admin pristup)
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.korisnik import Korisnik
from app.schemas.korisnik import KorisnikResponse, KorisnikUpdate
from app.utils.dependencies import get_current_admin, get_current_user_required
from app.utils.security import get_password_hash

router = APIRouter(prefix="/api/korisnici", tags=["Korisnici"])


@router.get("/", response_model=List[KorisnikResponse])
async def list_korisnici(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    aktivan: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Korisnik = Depends(get_current_admin)
):
    """
    Lista svih korisnika (samo admin).
    
    - **skip**: Broj preskočenih rezultata
    - **limit**: Maksimalni broj rezultata
    - **aktivan**: Filter po aktivnosti
    """
    query = db.query(Korisnik)
    
    if aktivan is not None:
        query = query.filter(Korisnik.aktivan == aktivan)
    
    korisnici = query.offset(skip).limit(limit).all()
    return korisnici


@router.get("/{korisnik_id}", response_model=KorisnikResponse)
async def get_korisnik(
    korisnik_id: int,
    db: Session = Depends(get_db),
    current_user: Korisnik = Depends(get_current_user_required)
):
    """
    Vraća podatke o korisniku po ID-u.
    
    Korisnik može videti samo svoje podatke, admin može videti sve.
    """
    # Provera prava pristupa
    if current_user.id_korisnik != korisnik_id and not current_user.super_korisnik:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nemate pravo pristupa podacima ovog korisnika"
        )
    
    korisnik = db.query(Korisnik).filter(
        Korisnik.id_korisnik == korisnik_id
    ).first()
    
    if not korisnik:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Korisnik nije pronađen"
        )
    
    return korisnik


@router.put("/{korisnik_id}", response_model=KorisnikResponse)
async def update_korisnik(
    korisnik_id: int,
    korisnik_update: KorisnikUpdate,
    db: Session = Depends(get_db),
    current_user: Korisnik = Depends(get_current_user_required)
):
    """
    Ažurira podatke o korisniku.
    
    Korisnik može ažurirati samo svoje podatke (osim super_korisnik).
    Admin može ažurirati sve podatke.
    """
    korisnik = db.query(Korisnik).filter(
        Korisnik.id_korisnik == korisnik_id
    ).first()
    
    if not korisnik:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Korisnik nije pronađen"
        )
    
    # Provera prava pristupa
    is_self = current_user.id_korisnik == korisnik_id
    is_admin = current_user.super_korisnik
    
    if not is_self and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nemate pravo da menjate podatke ovog korisnika"
        )
    
    # Ažuriranje dozvoljenih polja
    update_data = korisnik_update.model_dump(exclude_unset=True)
    
    # Samo admin može menjati super_korisnik i osnovne podatke (ime, prezime, email)
    if not is_admin:
        update_data.pop("super_korisnik", None)
        update_data.pop("aktivan", None)
        # Običan korisnik ne može menjati ime, prezime i email
        update_data.pop("ime", None)
        update_data.pop("prezime", None)
        update_data.pop("email", None)
        update_data.pop("username", None)
    
    for field, value in update_data.items():
        setattr(korisnik, field, value)
    
    db.commit()
    db.refresh(korisnik)
    
    return korisnik


@router.delete("/{korisnik_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_korisnik(
    korisnik_id: int,
    db: Session = Depends(get_db),
    current_user: Korisnik = Depends(get_current_admin)
):
    """
    Briše korisnika (samo admin).
    """
    korisnik = db.query(Korisnik).filter(
        Korisnik.id_korisnik == korisnik_id
    ).first()
    
    if not korisnik:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Korisnik nije pronađen"
        )
    
    # Ne dozvoljavamo brisanje sopstvenog naloga
    if korisnik.id_korisnik == current_user.id_korisnik:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ne možete obrisati svoj nalog"
        )
    
    db.delete(korisnik)
    db.commit()
    
    return None
