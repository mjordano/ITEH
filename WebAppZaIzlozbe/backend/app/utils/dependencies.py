"""
FastAPI zavisnosti (Dependencies)
Autentifikacija i autorizacija
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.korisnik import Korisnik
from app.utils.security import decode_access_token

# OAuth2 šema za token iz headera
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[Korisnik]:
    """
    Dobija trenutnog korisnika iz JWT tokena.
    Vraća None ako token nije prosleđen ili nije validan.
    """
    if not token:
        return None
        
    payload = decode_access_token(token)
    if payload is None:
        return None
    
    username: str = payload.get("sub")
    user_id: int = payload.get("user_id")
    
    if username is None or user_id is None:
        return None
    
    user = db.query(Korisnik).filter(Korisnik.id_korisnik == user_id).first()
    
    if user is None or not user.aktivan:
        return None
    
    return user


async def get_current_user_required(
    current_user: Optional[Korisnik] = Depends(get_current_user)
) -> Korisnik:
    """
    Zahteva prijavljenog korisnika.
    Baca izuzetak ako korisnik nije prijavljen.
    """
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Morate biti prijavljeni",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user


async def get_current_admin(
    current_user: Korisnik = Depends(get_current_user_required)
) -> Korisnik:
    """
    Zahteva administratora (super_korisnik=True).
    Baca izuzetak ako korisnik nije admin.
    """
    if not current_user.super_korisnik:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nemate administratorska prava"
        )
    return current_user
