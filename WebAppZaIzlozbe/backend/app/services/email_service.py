import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)


def send_registration_email(
    email: str,
    korisnik_ime: str,
    izlozba_naslov: str,
    qr_image: str,
    broj_karata: int,
    datum_izlozbe: Optional[str] = None,
    lokacija: Optional[str] = None
) -> bool:
    try:
        logger.info("=" * 60)
        logger.info("SIMULACIJA SLANJA EMAIL-a")
        logger.info("=" * 60)
        logger.info(f"Prima: {email}")
        logger.info(f"Predmet: Potvrda prijave - {izlozba_naslov}")
        logger.info("-" * 60)
        logger.info(f"Poštovani/a {korisnik_ime},")
        logger.info("")
        logger.info(f"Uspešno ste se prijavili za izložbu: {izlozba_naslov}")
        logger.info(f"Broj karata: {broj_karata}")
        
        if datum_izlozbe:
            logger.info(f"Datum: {datum_izlozbe}")
        if lokacija:
            logger.info(f"Lokacija: {lokacija}")
        
        logger.info("")
        logger.info("QR kod za ulaz je u prilogu ovog emaila.")
        logger.info("Molimo vas da ga pokažete na ulazu.")
        logger.info("")
        logger.info("Srdačan pozdrav,")
        logger.info("Tim Galerija")
        logger.info("-" * 60)
        logger.info(f"QR kod priložen: {'Da' if qr_image else 'Ne'}")
        logger.info(f"Vreme slanja: {datetime.utcnow().isoformat()}")
        logger.info("=" * 60)
        
        return True
        
    except Exception as e:
        logger.error(f"Greška pri slanju emaila: {str(e)}")
        return False


def send_validation_email(
    email: str,
    korisnik_ime: str,
    izlozba_naslov: str
) -> bool:
    try:
        logger.info("=" * 60)
        logger.info("SIMULACIJA SLANJA EMAIL-a - VALIDACIJA")
        logger.info("=" * 60)
        logger.info(f"Prima: {email}")
        logger.info(f"Predmet: Karta validirana - {izlozba_naslov}")
        logger.info("-" * 60)
        logger.info(f"Poštovani/a {korisnik_ime},")
        logger.info("")
        logger.info(f"Vaša karta za izložbu '{izlozba_naslov}' je uspešno validirana.")
        logger.info("Hvala vam na poseti!")
        logger.info("")
        logger.info("Srdačan pozdrav,")
        logger.info("Tim Galerija")
        logger.info("=" * 60)
        
        return True
        
    except Exception as e:
        logger.error(f"Greška pri slanju emaila: {str(e)}")
        return False
