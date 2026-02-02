"""
Pydantic šeme za JWT Token
"""
from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    """Šema za JWT token odgovor"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Šema za podatke iz tokena"""
    username: Optional[str] = None
    user_id: Optional[int] = None
