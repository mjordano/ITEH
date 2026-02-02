from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.prijava import Prijava
from app.models.izlozba import Izlozba
from app.models.korisnik import Korisnik
from app.schemas.prijava import PrijavaCreate, PrijavaUpdate, PrijavaResponse
from app.utils.dependencies import get_current_user_required, get_current_admin
from app.services.qr_service import generate_qr_code
from app.services.email_service import send_registration_email

router = APIRouter(prefix="/api/prijave", tags=["Prijave"])


@router.get("/", response_model=List[PrijavaResponse])
async def list_prijave(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    id_izlozba: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Korisnik = Depends(get_current_admin)
):
    query = db.query(Prijava).options(joinedload(Prijava.izlozba))
    
    if id_izlozba:
        query = query.filter(Prijava.id_izlozba == id_izlozba)
    

    
    prijave = query.order_by(Prijava.datum_registracije.desc()).offset(skip).limit(limit).all()
    return prijave


@router.get("/moje", response_model=List[PrijavaResponse])
async def list_moje_prijave(
    db: Session = Depends(get_db),
    current_user: Korisnik = Depends(get_current_user_required)
):
    prijave = db.query(Prijava).options(
        joinedload(Prijava.izlozba).joinedload(Izlozba.lokacija)
    ).filter(
        Prijava.id_korisnik == current_user.id_korisnik
    ).order_by(Prijava.datum_registracije.desc()).all()
    
    return prijave


@router.get("/{prijava_id}", response_model=PrijavaResponse)
async def get_prijava(
    prijava_id: int,
    db: Session = Depends(get_db),
    current_user: Korisnik = Depends(get_current_user_required)
):
    prijava = db.query(Prijava).options(
        joinedload(Prijava.izlozba).joinedload(Izlozba.lokacija)
    ).filter(Prijava.id_prijava == prijava_id).first()
    
    if not prijava:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prijava nije pronađena"
        )
    
    is_owner = prijava.id_korisnik == current_user.id_korisnik
    is_admin = current_user.super_korisnik
    
    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nemate pravo pristupa ovoj prijavi"
        )
    
    return prijava


@router.post("/", response_model=PrijavaResponse, status_code=status.HTTP_201_CREATED)
async def create_prijava(
    prijava: PrijavaCreate,
    db: Session = Depends(get_db),
    current_user: Korisnik = Depends(get_current_user_required)
):
    izlozba = db.query(Izlozba).options(
        joinedload(Izlozba.lokacija)
    ).filter(Izlozba.id_izlozba == prijava.id_izlozba).first()
    
    if not izlozba:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Izložba nije pronađena"
        )
    
    if not izlozba.objavljeno or not izlozba.aktivan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Izložba nije dostupna za prijavu"
        )
    
    if prijava.broj_karata > izlozba.preostali_kapacitet:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Nema dovoljno mesta. Preostalo: {izlozba.preostali_kapacitet}"
        )
    
    existing = db.query(Prijava).filter(
        Prijava.id_korisnik == current_user.id_korisnik,
        Prijava.id_izlozba == prijava.id_izlozba
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Već ste prijavljeni na ovu izložbu"
        )
    
    db_prijava = Prijava(
        id_korisnik=current_user.id_korisnik,
        id_izlozba=prijava.id_izlozba,
        broj_karata=prijava.broj_karata,
        datum_registracije=datetime.utcnow()
    )
    
    db.add(db_prijava)
    db.commit()
    db.refresh(db_prijava)
    
    qr_result = generate_qr_code(
        prijava_id=db_prijava.id_prijava,
        korisnik_id=current_user.id_korisnik,
        izlozba_id=prijava.id_izlozba,
        broj_karata=prijava.broj_karata
    )
    
    db_prijava.qr_kod = qr_result["qr_data"]
    db_prijava.slika_qr = qr_result["qr_image"]
    
    email_sent = send_registration_email(
        email=current_user.email,
        korisnik_ime=current_user.puno_ime,
        izlozba_naslov=izlozba.naslov,
        qr_image=qr_result["qr_image"],
        broj_karata=prijava.broj_karata,
        datum_izlozbe=f"{izlozba.datum_pocetka} - {izlozba.datum_zavrsetka}",
        lokacija=f"{izlozba.lokacija.naziv}, {izlozba.lokacija.adresa}" if izlozba.lokacija else None
    )
    
    if email_sent:
        db_prijava.email_poslat = True
        db_prijava.datum_slanja_emaila = datetime.utcnow()
    
    db.commit()
    db.refresh(db_prijava)
    
    return db_prijava





@router.delete("/{prijava_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prijava(
    prijava_id: int,
    db: Session = Depends(get_db),
    current_user: Korisnik = Depends(get_current_user_required)
):
    prijava = db.query(Prijava).filter(
        Prijava.id_prijava == prijava_id
    ).first()
    
    if not prijava:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prijava nije pronađena"
        )
    
    is_owner = prijava.id_korisnik == current_user.id_korisnik
    is_admin = current_user.super_korisnik
    
    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nemate pravo da otkažete ovu prijavu"
        )
    

    
    db.delete(prijava)
    db.commit()
    
    return None
