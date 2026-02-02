from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, HttpUrl



class SlikaBase(BaseModel):

    slika: str = Field(..., max_length=500)  # URL
    thumbnail: Optional[str] = Field(None, max_length=500)
    naslov: Optional[str] = Field(None, max_length=300)
    opis: Optional[str] = None
    fotograf: Optional[str] = Field(None, max_length=200)
    istaknuta: bool = False
    naslovna: bool = False
    redosled: int = 0


class SlikaCreate(SlikaBase):

    pass


class SlikaUpdate(BaseModel):

    slika: Optional[str] = Field(None, max_length=500)
    thumbnail: Optional[str] = Field(None, max_length=500)
    naslov: Optional[str] = Field(None, max_length=300)
    opis: Optional[str] = None
    fotograf: Optional[str] = Field(None, max_length=200)
    istaknuta: Optional[bool] = None
    naslovna: Optional[bool] = None
    redosled: Optional[int] = None


class SlikaResponse(SlikaBase):

    id_slika: int
    datum_otpremanja: datetime
    
    class Config:
        from_attributes = True
