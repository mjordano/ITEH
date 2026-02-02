import logging
import smtplib
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from datetime import datetime
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)


def send_email_smtp(to_email: str, subject: str, body_html: str, image_data: Optional[str] = None) -> bool:
    """
    Pomoćna funkcija za slanje emaila putem SMTP-a
    """
    try:
        # Kreiranje poruke
        msg = MIMEMultipart("related")
        msg["From"] = settings.SMTP_FROM_EMAIL
        msg["To"] = to_email
        msg["Subject"] = subject

        msg_alternative = MIMEMultipart("alternative")
        msg.attach(msg_alternative)

        # Tekst poruke
        msg_text = MIMEText(body_html, "html", "utf-8")
        msg_alternative.attach(msg_text)

        # Dodavanje QR koda ako postoji
        if image_data:
            # Ukloni header ako postoji (data:image/png;base64,)
            if "base64," in image_data:
                image_data = image_data.split("base64,")[1]
            
            img_bytes = base64.b64decode(image_data)
            img = MIMEImage(img_bytes)
            img.add_header("Content-ID", "<qr_code>")
            img.add_header("Content-Disposition", "inline", filename="qr_ticket.png")
            msg.attach(img)

        # Slanje
        if settings.SMTP_USER == "your_email@gmail.com":
            # Ako nisu podešeni pravi kredencijali, samo loguj
            logger.warning("SMTP kredencijali nisu podešeni. Email se ne šalje, samo loguje.")
            return True

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            
        return True

    except Exception as e:
        logger.error(f"Greška pri slanju emaila putem SMTP-a: {str(e)}")
        # Ne vraćamo False odmah ako je greška u konekciji da ne bi blokiralo user flow, 
        # ali u ovom slučaju funkcija očekuje bool za uspeh.
        return False


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
        logger.info(f"Slanje karte na email: {email}")
        
        # HTML template za email
        html_content = f"""
        <html>
          <body>
            <h2>Potvrda prijave - {izlozba_naslov}</h2>
            <p>Poštovani/a {korisnik_ime},</p>
            <p>Uspešno ste se prijavili za izložbu: <strong>{izlozba_naslov}</strong></p>
            <p><strong>Broj karata:</strong> {broj_karata}</p>
            {f'<p><strong>Datum:</strong> {datum_izlozbe}</p>' if datum_izlozbe else ''}
            {f'<p><strong>Lokacija:</strong> {lokacija}</p>' if lokacija else ''}
            
            <p>Vaš QR kod za ulaz se nalazi u nastavku. Molimo vas da ga pokažete na ulazu.</p>
            <br>
            <img src="cid:qr_code" alt="QR Kod" style="width: 200px; height: 200px;">
            <br>
            <p>Srdačan pozdrav,<br>Tim Galerija</p>
          </body>
        </html>
        """

        success = send_email_smtp(
            to_email=email,
            subject=f"Vaša karta za izložbu: {izlozba_naslov}",
            body_html=html_content,
            image_data=qr_image
        )

        if success:
            logger.info("Email uspešno poslat.")
        else:
            logger.warning("Email NIJE poslat (proverite logove).")
            
        logger.info("=" * 60)
        return success
        
    except Exception as e:
        logger.error(f"Greška u send_registration_email: {str(e)}")
        return False



