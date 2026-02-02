"""Dodavanje indeksa

Revision ID: 002
Revises: 001
Create Date: 2024-01-01

Druga migracija - dodaje indekse za bolje performanse
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Indeksi za izlozbe
    op.create_index('ix_izlozbe_datum_pocetka', 'izlozbe', ['datum_pocetka'])
    op.create_index('ix_izlozbe_aktivan', 'izlozbe', ['aktivan'])
    op.create_index('ix_izlozbe_objavljeno', 'izlozbe', ['objavljeno'])
    
    # Indeksi za prijave
    op.create_index('ix_prijave_id_korisnik', 'prijave', ['id_korisnik'])
    op.create_index('ix_prijave_id_izlozba', 'prijave', ['id_izlozba'])
    op.create_index('ix_prijave_validirano', 'prijave', ['validirano'])
    
    # Kompozitni indeks za prijave
    op.create_index(
        'ix_prijave_korisnik_izlozba', 
        'prijave', 
        ['id_korisnik', 'id_izlozba'],
        unique=True
    )


def downgrade() -> None:
    op.drop_index('ix_prijave_korisnik_izlozba', 'prijave')
    op.drop_index('ix_prijave_validirano', 'prijave')
    op.drop_index('ix_prijave_id_izlozba', 'prijave')
    op.drop_index('ix_prijave_id_korisnik', 'prijave')
    op.drop_index('ix_izlozbe_objavljeno', 'izlozbe')
    op.drop_index('ix_izlozbe_aktivan', 'izlozbe')
    op.drop_index('ix_izlozbe_datum_pocetka', 'izlozbe')
