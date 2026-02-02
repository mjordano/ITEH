"""
Konfiguracija baze podataka
SQLAlchemy engine i sesija
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Kreiranje database engine-a
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Provera konekcije pre korišćenja
    pool_size=5,
    max_overflow=10
)

# Kreiranje sesije
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Bazna klasa za modele
Base = declarative_base()


def get_db():
    """
    Dependency za dobijanje database sesije.
    Koristi se u FastAPI endpointima.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
