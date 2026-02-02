"""
Model Korisnik (User)
Predstavlja korisnika sistema sa informacijama o profilu i privilegijama
"""
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

if TYPE_CHECKING:
    from app.models.prijava import Prijava


class Korisnik(Base):
    """
    Model korisnika sistema.
    
    Atributi:
        - id_korisnik: Primarni ključ
        - username: Jedinstveno korisničko ime
        - email: Email adresa (jedinstvena)
        - lozinka: Heširana lozinka
        - ime, prezime: Lični podaci
        - telefon: Kontakt telefon
        - profilna_slika: URL do profilne slike
        - aktivan: Da li je nalog aktivan
        - super_korisnik: Da li je administrator
        - datum_pridruzivanja: Datum kreiranja naloga
        - poslednja_prijava: Datum poslednje prijave
    """
    __tablename__ = "korisnici"
    
    id_korisnik: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    lozinka: Mapped[str] = mapped_column(String(255))
    ime: Mapped[str] = mapped_column(String(50))
    prezime: Mapped[str] = mapped_column(String(50))
    telefon: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    profilna_slika: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    grad: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    adresa: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    aktivan: Mapped[bool] = mapped_column(Boolean, default=True)
    super_korisnik: Mapped[bool] = mapped_column(Boolean, default=False)
    datum_pridruzivanja: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    poslednja_prijava: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True
    )
    
    # Relacija sa prijavama (1:N)
    prijave: Mapped[List["Prijava"]] = relationship(
        "Prijava", 
        back_populates="korisnik",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Korisnik(id={self.id_korisnik}, username='{self.username}')>"
    
    @property
    def puno_ime(self) -> str:
        """Vraća puno ime korisnika"""
        return f"{self.ime} {self.prezime}"
    
    @property
    def is_admin(self) -> bool:
        """Proverava da li je korisnik administrator"""
        return self.super_korisnik
