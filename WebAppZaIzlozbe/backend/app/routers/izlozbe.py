from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query, Form, File, UploadFile
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from app.database import get_db
from app.models.izlozba import Izlozba
from app.models.lokacija import Lokacija
from app.models.korisnik import Korisnik
from app.schemas.izlozba import (
    IzlozbaCreate, IzlozbaUpdate, IzlozbaResponse, IzlozbaListResponse
)
from app.utils.dependencies import get_current_admin
from app.utils.file_upload import save_upload_file, save_upload_files


router = APIRouter(prefix="/api/izlozbe", tags=["Izložbe"])


@router.get("/", response_model=IzlozbaListResponse)
async def list_izlozbe(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    search: Optional[str] = None,
    grad: Optional[str] = None,
    aktivan: Optional[bool] = None,
    objavljeno: Optional[bool] = True,
    od_datuma: Optional[date] = None,
    do_datuma: Optional[date] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Izlozba).options(
        joinedload(Izlozba.lokacija),
        joinedload(Izlozba.slika_naslovna),
        joinedload(Izlozba.slike)
    )
    
    if search:
        query = query.filter(
            or_(
                Izlozba.naslov.ilike(f"%{search}%"),
                Izlozba.opis.ilike(f"%{search}%"),
                Izlozba.kratak_opis.ilike(f"%{search}%")
            )
        )
    
    if grad:
        query = query.join(Lokacija).filter(Lokacija.grad.ilike(f"%{grad}%"))
    
    if aktivan is not None:
        query = query.filter(Izlozba.aktivan == aktivan)
    
    if objavljeno is not None:
        query = query.filter(Izlozba.objavljeno == objavljeno)
    
    if od_datuma:
        query = query.filter(Izlozba.datum_pocetka >= od_datuma)
    
    if do_datuma:
        query = query.filter(Izlozba.datum_zavrsetka <= do_datuma)
    
    total = query.count()
    
    skip = (page - 1) * per_page
    izlozbe = query.order_by(Izlozba.datum_pocetka.desc()).offset(skip).limit(per_page).all()
    
    items = []
    for izlozba in izlozbe:
        izlozba_dict = IzlozbaResponse.model_validate(izlozba).model_dump()
        izlozba_dict["preostali_kapacitet"] = izlozba.preostali_kapacitet
        items.append(IzlozbaResponse(**izlozba_dict))
    
    return IzlozbaListResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        pages=(total + per_page - 1) // per_page
    )


@router.get("/slug/{slug}", response_model=IzlozbaResponse)
async def get_izlozba_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    izlozba = db.query(Izlozba).options(
        joinedload(Izlozba.lokacija),
        joinedload(Izlozba.slika_naslovna),
        joinedload(Izlozba.slike)
    ).filter(Izlozba.slug == slug).first()
    
    if not izlozba:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Izložba nije pronađena"
        )
    
    response = IzlozbaResponse.model_validate(izlozba)
    response_dict = response.model_dump()
    response_dict["preostali_kapacitet"] = izlozba.preostali_kapacitet
    
    return IzlozbaResponse(**response_dict)
    
@router.get("/{izlozba_id}", response_model=IzlozbaResponse)
async def get_izlozba(
    izlozba_id: int,
    db: Session = Depends(get_db)
):
    izlozba = db.query(Izlozba).options(
        joinedload(Izlozba.lokacija),
        joinedload(Izlozba.slika_naslovna),
        joinedload(Izlozba.slike)
    ).filter(Izlozba.id_izlozba == izlozba_id).first()
    
    if not izlozba:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Izložba nije pronađena"
        )
    
    response = IzlozbaResponse.model_validate(izlozba)
    response_dict = response.model_dump()
    response_dict["preostali_kapacitet"] = izlozba.preostali_kapacitet
    
    return IzlozbaResponse(**response_dict)


@router.post("/", response_model=IzlozbaResponse, status_code=status.HTTP_201_CREATED)
async def create_izlozba(
    naslov: str = Form(...),
    slug: str = Form(...),
    id_lokacija: int = Form(...),
    datum_pocetka: date = Form(...),
    datum_zavrsetka: date = Form(...),
    kapacitet: int = Form(100),
    opis: Optional[str] = Form(None),
    kratak_opis: Optional[str] = Form(None),
    osmislio: Optional[str] = Form(None),
    aktivan: bool = Form(True),
    objavljeno: bool = Form(False),
    thumbnail_file: UploadFile = File(...),
    slike_files: List[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: Korisnik = Depends(get_current_admin)
):
    lokacija = db.query(Lokacija).filter(
        Lokacija.id_lokacija == id_lokacija
    ).first()
    
    if not lokacija:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lokacija ne postoji"
        )
    
    existing_slug = db.query(Izlozba).filter(Izlozba.slug == slug).first()
    if existing_slug:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Izložba sa ovim slugom već postoji"
        )
    
    thumbnail_path = await save_upload_file(thumbnail_file)
    
    db_izlozba = Izlozba(
        naslov=naslov,
        slug=slug,
        id_lokacija=id_lokacija,
        datum_pocetka=datum_pocetka,
        datum_zavrsetka=datum_zavrsetka,
        kapacitet=kapacitet,
        opis=opis,
        kratak_opis=kratak_opis,
        osmislio=osmislio,
        aktivan=aktivan,
        objavljeno=objavljeno,
        thumbnail=thumbnail_path
    )
    db.add(db_izlozba)
    db.commit()
    db.refresh(db_izlozba)
    
    if slike_files:
        from app.models.slika import Slika
        saved_paths = await save_upload_files(slike_files)
        
        for path in saved_paths:
            nova_slika = Slika(
                slika=path,
                thumbnail=path,
                id_izlozba=db_izlozba.id_izlozba,
                naslov=db_izlozba.naslov
            )
            db.add(nova_slika)
        
        db.commit()
        db.refresh(db_izlozba)
    
    return db_izlozba


@router.put("/{izlozba_id}", response_model=IzlozbaResponse)
async def update_izlozba(
    izlozba_id: int,
    naslov: Optional[str] = Form(None),
    slug: Optional[str] = Form(None),
    id_lokacija: Optional[int] = Form(None),
    datum_pocetka: Optional[date] = Form(None),
    datum_zavrsetka: Optional[date] = Form(None),
    kapacitet: Optional[int] = Form(None),
    opis: Optional[str] = Form(None),
    kratak_opis: Optional[str] = Form(None),
    osmislio: Optional[str] = Form(None),
    aktivan: Optional[bool] = Form(None),
    objavljeno: Optional[bool] = Form(None),
    thumbnail_file: Optional[UploadFile] = File(None),
    slike_files: List[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: Korisnik = Depends(get_current_admin)
):
    izlozba = db.query(Izlozba).filter(
        Izlozba.id_izlozba == izlozba_id
    ).first()
    
    if not izlozba:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Izložba nije pronađena"
        )
    
    if slug and slug != izlozba.slug:
        existing_slug = db.query(Izlozba).filter(Izlozba.slug == slug).first()
        if existing_slug:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Izložba sa ovim slugom već postoji"
            )
            
    if kapacitet is not None:
        ukupno_prijava = sum(p.broj_karata for p in izlozba.prijave)
        if kapacitet < ukupno_prijava:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Kapacitet ne može biti manji od broja prijava ({ukupno_prijava})"
            )

    if naslov: izlozba.naslov = naslov
    if slug: izlozba.slug = slug
    if id_lokacija: izlozba.id_lokacija = id_lokacija
    if datum_pocetka: izlozba.datum_pocetka = datum_pocetka
    if datum_zavrsetka: izlozba.datum_zavrsetka = datum_zavrsetka
    if kapacitet: izlozba.kapacitet = kapacitet
    if opis: izlozba.opis = opis
    if kratak_opis: izlozba.kratak_opis = kratak_opis
    if osmislio: izlozba.osmislio = osmislio
    if aktivan is not None: izlozba.aktivan = aktivan
    if objavljeno is not None: izlozba.objavljeno = objavljeno
    
    if thumbnail_file:
        izlozba.thumbnail = await save_upload_file(thumbnail_file)
        
    if slike_files:
        from app.models.slika import Slika

        saved_paths = await save_upload_files(slike_files)
        for path in saved_paths:
            nova_slika = Slika(
                slika=path,
                thumbnail=path,
                id_izlozba=izlozba_id,
                naslov=izlozba.naslov
            )
            db.add(nova_slika)

    db.commit()
    db.refresh(izlozba)
    
    return izlozba


@router.delete("/{izlozba_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_izlozba(
    izlozba_id: int,
    db: Session = Depends(get_db),
    current_user: Korisnik = Depends(get_current_admin)
):
    izlozba = db.query(Izlozba).filter(
        Izlozba.id_izlozba == izlozba_id
    ).first()
    
    if not izlozba:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Izložba nije pronađena"
        )
    
    db.delete(izlozba)
    db.commit()
    
    return None
