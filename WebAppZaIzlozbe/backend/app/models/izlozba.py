"""
Model Izlozba (Exhibition)
Predstavlja izložbu fotografija
"""
from datetime import datetime, date
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Text, Boolean, Integer, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

if TYPE_CHECKING:
    from app.models.lokacija import Lokacija
    from app.models.slika import Slika
    from app.models.prijava import Prijava


class Izlozba(Base):
    """
    Model izložbe fotografija.
    
    Atributi:
        - id_izlozba: Primarni ključ
        - id_slika: FK ka naslovnoj slici
        - naslov: Naslov izložbe
        - opis: Detaljan opis
        - kratak_opis: Kratki opis za preview
        - datum_pocetka: Datum početka izložbe
        - datum_zavrsetka: Datum završetka
        - id_lokacija: FK ka lokaciji
        - kapacitet: Maksimalni broj posetilaca
        - thumbnail: URL do thumbnail-a
        - osmislio: Ko je osmislio izložbu
        - aktivan: Da li je izložba aktivna
        - objavljeno: Da li je izložba objavljena
        - datum_kreiranja: Datum kreiranja zapisa
        - datum_izmene: Datum poslednje izmene
    """
    __tablename__ = "izlozbe"
    
    id_izlozba: Mapped[int] = mapped_column(primary_key=True, index=True)
    slug: Mapped[str] = mapped_column(String(310), unique=True, index=True)
    id_slika: Mapped[Optional[int]] = mapped_column(
        ForeignKey("slike.id_slika"), nullable=True
    )
    naslov: Mapped[str] = mapped_column(String(300))
    opis: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    kratak_opis: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    datum_pocetka: Mapped[date] = mapped_column(Date)
    datum_zavrsetka: Mapped[date] = mapped_column(Date)
    id_lokacija: Mapped[int] = mapped_column(
        ForeignKey("lokacije.id_lokacija")
    )
    kapacitet: Mapped[int] = mapped_column(Integer, default=100)
    thumbnail: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    osmislio: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    aktivan: Mapped[bool] = mapped_column(Boolean, default=True)
    objavljeno: Mapped[bool] = mapped_column(Boolean, default=False)
    datum_kreiranja: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    datum_izmene: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, onupdate=datetime.utcnow
    )
    
    # Relacije
    lokacija: Mapped["Lokacija"] = relationship(
        "Lokacija",
        back_populates="izlozbe"
    )
    
    slika_naslovna: Mapped[Optional["Slika"]] = relationship(
        "Slika",
        back_populates="izlozba_naslovna",
        foreign_keys=[id_slika]
    )
    
    slike: Mapped[List["Slika"]] = relationship(
        "Slika",
        back_populates="izlozba",
        foreign_keys="[Slika.id_izlozba]",
        cascade="all, delete-orphan"
    )
    
    prijave: Mapped[List["Prijava"]] = relationship(
        "Prijava",
        back_populates="izlozba",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Izlozba(id={self.id_izlozba}, naslov='{self.naslov}')>"
    
    @property
    def preostali_kapacitet(self) -> int:
        """Izračunava preostali kapacitet"""
        ukupno_prijava = sum(p.broj_karata for p in self.prijave)
        return max(0, self.kapacitet - ukupno_prijava)
    
    @property
    def is_active(self) -> bool:
        """Proverava da li je izložba trenutno aktivna"""
        today = date.today()
        return (
            self.aktivan and 
            self.objavljeno and 
            self.datum_pocetka <= today <= self.datum_zavrsetka
        )
