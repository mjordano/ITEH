import qrcode
import json
import base64
from io import BytesIO
from datetime import datetime
from typing import Dict, Any


def generate_qr_data(
    prijava_id: int,
    korisnik_id: int,
    izlozba_id: int,
    broj_karata: int
) -> str:
    data = {
        "prijava_id": prijava_id,
        "korisnik_id": korisnik_id,
        "izlozba_id": izlozba_id,
        "broj_karata": broj_karata,
        "datum_generisanja": datetime.utcnow().isoformat(),
        "verzija": "1.0"
    }
    return json.dumps(data)


def generate_qr_code(
    prijava_id: int,
    korisnik_id: int,
    izlozba_id: int,
    broj_karata: int
) -> Dict[str, str]:
    qr_data = generate_qr_data(prijava_id, korisnik_id, izlozba_id, broj_karata)
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    return {
        "qr_data": qr_data,
        "qr_image": f"data:image/png;base64,{img_base64}"
    }


def decode_qr_data(qr_data: str) -> Dict[str, Any]:
    try:
        data = json.loads(qr_data)
        required_fields = ["prijava_id", "korisnik_id", "izlozba_id"]
        
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Nedostaje polje: {field}")
        
        return data
    except json.JSONDecodeError:
        raise ValueError("Neispravan format QR koda")
