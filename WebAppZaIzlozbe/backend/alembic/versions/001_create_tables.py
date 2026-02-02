"""Kreiranje svih tabela

Revision ID: 001
Revises: 
Create Date: 2024-01-01

Prva migracija - kreira sve tabele bez foreign key-eva
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Kreiranje tabele korisnici
    op.create_table(
        'korisnici',
        sa.Column('id_korisnik', sa.Integer(), primary_key=True, index=True),
        sa.Column('username', sa.String(50), unique=True, index=True, nullable=False),
        sa.Column('email', sa.String(100), unique=True, index=True, nullable=False),
        sa.Column('lozinka', sa.String(255), nullable=False),
        sa.Column('ime', sa.String(50), nullable=False),
        sa.Column('prezime', sa.String(50), nullable=False),
        sa.Column('telefon', sa.String(20), nullable=True),
        sa.Column('profilna_slika', sa.String(500), nullable=True),
        sa.Column('aktivan', sa.Boolean(), default=True),
        sa.Column('osoblje', sa.Boolean(), default=False),
        sa.Column('super_korisnik', sa.Boolean(), default=False),
        sa.Column('datum_pridruzivanja', sa.DateTime(), nullable=False),
        sa.Column('poslednja_prijava', sa.DateTime(), nullable=True),
    )
    
    # Kreiranje tabele lokacije
    op.create_table(
        'lokacije',
        sa.Column('id_lokacija', sa.Integer(), primary_key=True, index=True),
        sa.Column('naziv', sa.String(200), nullable=False),
        sa.Column('opis', sa.Text(), nullable=True),
        sa.Column('g_sirina', sa.Float(), nullable=True),
        sa.Column('g_duzina', sa.Float(), nullable=True),
        sa.Column('adresa', sa.String(300), nullable=False),
        sa.Column('grad', sa.String(100), index=True, nullable=False),
    )
    
    # Kreiranje tabele slike
    op.create_table(
        'slike',
        sa.Column('id_slika', sa.Integer(), primary_key=True, index=True),
        sa.Column('slika', sa.String(500), nullable=False),
        sa.Column('thumbnail', sa.String(500), nullable=True),
        sa.Column('naslov', sa.String(300), nullable=True),
        sa.Column('opis', sa.Text(), nullable=True),
        sa.Column('fotograf', sa.String(200), nullable=True),
        sa.Column('datum_otpremanja', sa.DateTime(), nullable=False),
        sa.Column('istaknuta', sa.Boolean(), default=False),
        sa.Column('naslovna', sa.Boolean(), default=False),
        sa.Column('redosled', sa.Integer(), default=0),
    )
    
    # Kreiranje tabele izlozbe
    op.create_table(
        'izlozbe',
        sa.Column('id_izlozba', sa.Integer(), primary_key=True, index=True),
        sa.Column('id_slika', sa.Integer(), nullable=True),
        sa.Column('naslov', sa.String(300), nullable=False),
        sa.Column('opis', sa.Text(), nullable=True),
        sa.Column('kratak_opis', sa.String(500), nullable=True),
        sa.Column('datum_pocetka', sa.Date(), nullable=False),
        sa.Column('datum_zavrsetka', sa.Date(), nullable=False),
        sa.Column('id_lokacija', sa.Integer(), nullable=False),
        sa.Column('kapacitet', sa.Integer(), default=100),
        sa.Column('thumbnail', sa.String(500), nullable=True),
        sa.Column('osmislio', sa.String(200), nullable=True),
        sa.Column('aktivan', sa.Boolean(), default=True),
        sa.Column('objavljeno', sa.Boolean(), default=False),
        sa.Column('datum_kreiranja', sa.DateTime(), nullable=False),
        sa.Column('datum_izmene', sa.DateTime(), nullable=True),
    )
    
    # Kreiranje tabele prijave
    op.create_table(
        'prijave',
        sa.Column('id_prijava', sa.Integer(), primary_key=True, index=True),
        sa.Column('id_korisnik', sa.Integer(), nullable=False),
        sa.Column('id_izlozba', sa.Integer(), nullable=False),
        sa.Column('id_slika', sa.Integer(), nullable=True),
        sa.Column('broj_karata', sa.Integer(), default=1),
        sa.Column('qr_kod', sa.String(500), nullable=True),
        sa.Column('validirano', sa.Boolean(), default=False),
        sa.Column('datum_registracije', sa.DateTime(), nullable=False),
        sa.Column('slika_qr', sa.Text(), nullable=True),
        sa.Column('verifikovan_email', sa.Boolean(), default=False),
        sa.Column('email_poslat', sa.Boolean(), default=False),
        sa.Column('datum_slanja_emaila', sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('prijave')
    op.drop_table('izlozbe')
    op.drop_table('slike')
    op.drop_table('lokacije')
    op.drop_table('korisnici')
