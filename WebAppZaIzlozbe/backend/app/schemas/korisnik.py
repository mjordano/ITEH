"""
Pydantic šeme za Korisnik (User)
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class KorisnikBase(BaseModel):
    """Bazna šema za korisnika"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    ime: str = Field(..., min_length=1, max_length=50)
    prezime: str = Field(..., min_length=1, max_length=50)
    telefon: Optional[str] = Field(None, max_length=20)
    grad: Optional[str] = Field(None, max_length=100)
    adresa: Optional[str] = Field(None, max_length=200)
    profilna_slika: Optional[str] = None


class KorisnikCreate(KorisnikBase):
    """Šema za kreiranje korisnika"""
    lozinka: str = Field(..., min_length=6, max_length=100)


class KorisnikUpdate(BaseModel):
    """Šema za ažuriranje korisnika"""
    ime: Optional[str] = Field(None, min_length=1, max_length=50)
    prezime: Optional[str] = Field(None, min_length=1, max_length=50)
    telefon: Optional[str] = Field(None, max_length=20)
    grad: Optional[str] = Field(None, max_length=100)
    adresa: Optional[str] = Field(None, max_length=200)
    profilna_slika: Optional[str] = None
    aktivan: Optional[bool] = None
    super_korisnik: Optional[bool] = None


class KorisnikResponse(KorisnikBase):
    """Šema za odgovor sa podacima korisnika"""
    id_korisnik: int
    aktivan: bool
    super_korisnik: bool
    datum_pridruzivanja: datetime
    poslednja_prijava: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class KorisnikLogin(BaseModel):
    """Šema za prijavu korisnika"""
    username: str
    lozinka: str
