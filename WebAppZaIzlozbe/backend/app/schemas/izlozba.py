from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from app.schemas.lokacija import LokacijaResponse
from app.schemas.slika import SlikaResponse


class IzlozbaBase(BaseModel):

    naslov: str = Field(..., min_length=1, max_length=300)
    slug: str = Field(..., min_length=1, max_length=310)
    opis: Optional[str] = None
    kratak_opis: Optional[str] = Field(None, max_length=500)
    datum_pocetka: date
    datum_zavrsetka: date
    id_lokacija: int
    kapacitet: int = Field(default=100, ge=1)
    thumbnail: Optional[str] = Field(None, max_length=500)
    osmislio: Optional[str] = Field(None, max_length=200)
    aktivan: bool = True
    objavljeno: bool = False
    id_slika: Optional[int] = None
    slike_urls: List[str] = Field(default_factory=list)

    @field_validator('datum_zavrsetka')
    @classmethod
    def datum_zavrsetka_posle_pocetka(cls, v, info):
        if 'datum_pocetka' in info.data and v < info.data['datum_pocetka']:
            raise ValueError('Datum završetka mora biti posle datuma početka')
        return v


class IzlozbaCreate(IzlozbaBase):
    pass



class IzlozbaUpdate(BaseModel):

    naslov: Optional[str] = Field(None, min_length=1, max_length=300)
    slug: Optional[str] = Field(None, min_length=1, max_length=310)
    opis: Optional[str] = None
    kratak_opis: Optional[str] = Field(None, max_length=500)
    datum_pocetka: Optional[date] = None
    datum_zavrsetka: Optional[date] = None
    id_lokacija: Optional[int] = None
    kapacitet: Optional[int] = Field(None, ge=1)
    thumbnail: Optional[str] = Field(None, max_length=500)
    osmislio: Optional[str] = Field(None, max_length=200)
    aktivan: Optional[bool] = None
    objavljeno: Optional[bool] = None
    id_slika: Optional[int] = None
    slike_urls: Optional[List[str]] = None


class IzlozbaResponse(IzlozbaBase):

    id_izlozba: int
    datum_kreiranja: datetime
    datum_izmene: Optional[datetime] = None
    lokacija: Optional[LokacijaResponse] = None
    slika_naslovna: Optional[SlikaResponse] = None
    slike: List[SlikaResponse] = []
    preostali_kapacitet: Optional[int] = None
    
    class Config:
        from_attributes = True


class IzlozbaListResponse(BaseModel):

    items: List[IzlozbaResponse]
    total: int
    page: int
    per_page: int
    pages: int
