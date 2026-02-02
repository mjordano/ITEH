"""
Sigurnosne funkcije
Heširanje lozinki i JWT token operacije
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings

# Kontekst za heširanje lozinki (bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifikuje da li se plain text lozinka poklapa sa heširanom.
    
    Args:
        plain_password: Lozinka u plain text-u
        hashed_password: Heširana lozinka iz baze
        
    Returns:
        True ako se lozinke poklapaju, False inače
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hešira lozinku koristeći bcrypt.
    
    Args:
        password: Lozinka u plain text-u
        
    Returns:
        Heširana lozinka
    """
    # Bcrypt ima limit od 72 bajta, skratimo ako je potrebno
    password_bytes = password.encode('utf-8')[:72]
    password_truncated = password_bytes.decode('utf-8', errors='ignore')
    return pwd_context.hash(password_truncated)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Kreira JWT access token.
    
    Args:
        data: Podaci koji se enkoduju u token
        expires_delta: Opciono, vreme isteka tokena
        
    Returns:
        Enkodovan JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    Dekoduje JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        Dekodurani podaci ili None ako token nije validan
    """
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None
