"""Dodavanje foreign key-eva

Revision ID: 003
Revises: 002
Create Date: 2024-01-01

Treća migracija - dodaje foreign key constraints
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Foreign keys za izlozbe
    op.create_foreign_key(
        'fk_izlozbe_lokacija',
        'izlozbe', 'lokacije',
        ['id_lokacija'], ['id_lokacija'],
        ondelete='CASCADE'
    )
    
    op.create_foreign_key(
        'fk_izlozbe_slika',
        'izlozbe', 'slike',
        ['id_slika'], ['id_slika'],
        ondelete='SET NULL'
    )
    
    # Foreign keys za prijave
    op.create_foreign_key(
        'fk_prijave_korisnik',
        'prijave', 'korisnici',
        ['id_korisnik'], ['id_korisnik'],
        ondelete='CASCADE'
    )
    
    op.create_foreign_key(
        'fk_prijave_izlozba',
        'prijave', 'izlozbe',
        ['id_izlozba'], ['id_izlozba'],
        ondelete='CASCADE'
    )
    
    op.create_foreign_key(
        'fk_prijave_slika',
        'prijave', 'slike',
        ['id_slika'], ['id_slika'],
        ondelete='SET NULL'
    )


def downgrade() -> None:
    op.drop_constraint('fk_prijave_slika', 'prijave', type_='foreignkey')
    op.drop_constraint('fk_prijave_izlozba', 'prijave', type_='foreignkey')
    op.drop_constraint('fk_prijave_korisnik', 'prijave', type_='foreignkey')
    op.drop_constraint('fk_izlozbe_slika', 'izlozbe', type_='foreignkey')
    op.drop_constraint('fk_izlozbe_lokacija', 'izlozbe', type_='foreignkey')
