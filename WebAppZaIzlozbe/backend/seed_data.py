import sys
import os
import httpx
import re
import random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, date, timedelta
from app.database import SessionLocal, engine, Base
from app.models import Korisnik, Lokacija, Slika, Izlozba, Prijava
from app.utils.security import get_password_hash

Base.metadata.create_all(bind=engine)

def clean_html(raw_html):
    if not raw_html: return ""
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext[:500] if cleantext else ""

def fetch_artic_artwork(query, limit=1):
    try:
        url = "https://api.artic.edu/api/v1/artworks/search"
        params = {
            "q": query,
            "fields": "id,title,image_id,artist_display,description,short_description,date_display",
            "limit": limit + 2,
            "page": 1
        }
        # Timeout slightly increased for API calls
        response = httpx.get(url, params=params, timeout=15.0)
        response.raise_for_status()
        data = response.json()
        # Filter items with image_id
        results = [art for art in data.get('data', []) if art.get('image_id')]
        return results[:limit]
    except Exception as e:
        print(f"Greška prilikom preuzimanja sa Artic API za '{query}': {e}")
        return []

def get_image_url(image_id, size=843):
    return f"https://www.artic.edu/iiif/2/{image_id}/full/{size},/0/default.jpg"

def seed_database():
    db = SessionLocal()
    
    try:
        print("Brisanje i re-kreiranje šeme baze...")
        from sqlalchemy import text
        db.execute(text("DROP TABLE IF EXISTS prijave CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS slike CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS izlozbe CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS lokacije CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS korisnici CASCADE"))
        db.commit()
        
        Base.metadata.create_all(bind=engine)

        if db.query(Korisnik).count() > 0:
            print("Podaci već postoje.")
            return
        
        print("Kreiranje test podataka...")
        
        admin = Korisnik(
            username="admin",
            email="admin@galerija.rs",
            lozinka=get_password_hash("admin123"),
            ime="Admin",
            prezime="Korisnik",
            telefon="+381601234567",
            aktivan=True,
            super_korisnik=True,
            datum_pridruzivanja=datetime.utcnow()
        )
        
        korisnik = Korisnik(
            username="marko",
            email="marko@email.com",
            lozinka=get_password_hash("marko123"),
            ime="Marko",
            prezime="Marković",
            telefon="+381621234567",
            aktivan=True,
            super_korisnik=False,
            datum_pridruzivanja=datetime.utcnow()
        )
        
        db.add_all([admin, korisnik])
        db.commit()
        print("✓ Korisnici kreirani")
        
        lokacija1 = Lokacija(
            naziv="Galerija SANU",
            opis="Galerija Srpske akademije nauka i umetnosti",
            g_sirina=44.8176,
            g_duzina=20.4569,
            adresa="Knez Mihailova 35",
            grad="Beograd"
        )
        
        lokacija2 = Lokacija(
            naziv="Muzej savremene umetnosti",
            opis="Muzej savremene umetnosti Beograd",
            g_sirina=44.8184,
            g_duzina=20.4111,
            adresa="Ušće 10, blok 15",
            grad="Beograd"
        )
        
        lokacija3 = Lokacija(
            naziv="Galerija Matice srpske",
            opis="Najstarija srpska institucija kulture",
            g_sirina=45.2551,
            g_duzina=19.8451,
            adresa="Trg galerija 1",
            grad="Novi Sad"
        )
        
        lokacija4 = Lokacija(
            naziv="Narodni muzej Niš",
            opis="Multimedijalni muzejski kompleks sa stalnom postavkom i povremenim izložbama",
            g_sirina=43.3209,
            g_duzina=21.8958,
            adresa="Generala Milojka Lešjanina 21",
            grad="Niš"
        )
        
        lokacija5 = Lokacija(
            naziv="Galerija RIMA Kragujevac",
            opis="Savremena galerija sa fokusom na modernu umetnost",
            g_sirina=44.0128,
            g_duzina=20.9114,
            adresa="Trg Radomira Putnika 4",
            grad="Kragujevac"
        )
        
        lokacije = [lokacija1, lokacija2, lokacija3, lokacija4, lokacija5]
        db.add_all(lokacije)
        db.commit()
        print("✓ Lokacije kreirane")
        
        print("Preuzimanje slika sa Artic API...")
        
        # Upiti koji odgovaraju temama izložbi redom (korišćeni indeksi 0-6)
        # 0: Industrijsko/American -> "Grant Wood"
        # 1: Impresionizam -> "Seurat"
        # 2: Realizam -> "Edward Hopper"
        # 3: Van Gogh -> "Van Gogh"
        # 4: Apstraktno -> "Kandinsky"
        # 5: Nadrealizam -> "Salvador Dali"
        # 6: Fotografija -> "landscape" ili "photography"
        
        queries = [
            "Grant Wood",    # za index 0
            "Seurat",        # za index 1
            "Edward Hopper", # za index 2
            "Van Gogh",      # za index 3
            "Kandinsky",     # za index 4
            "Salvador Dali", # za index 5
            "landscape"      # za index 6
        ]
        
        slike = []
        
        # Helper za kreiranje Slika objekta
        def create_slika_obj(art_data, order, istaknuta=False, naslovna=False):
            if not art_data:
                # Fallback ako API ne vrati ništa
                return Slika(
                    slika="https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=1000",
                    thumbnail="https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=400",
                    naslov="Umetničko delo (Nije pronađeno)",
                    opis="Slika nije dostupna.",
                    fotograf="Nepoznat",
                    datum_otpremanja=datetime.utcnow(),
                    istaknuta=istaknuta,
                    naslovna=naslovna,
                    redosled=order
                )
            
            desc = art_data.get('description') or art_data.get('short_description') or "Umetničko delo iz Artic kolekcije."
            clean_desc = clean_html(desc)
            
            # Skrati naslov i fotografa ako su predugački
            naslov = art_data.get('title', 'Bez naslova')[:250]
            artist = art_data.get('artist_display', 'Nepoznat umetnik')
            # Artist field is often "Grant Wood\nAmerican, 1891-1942". Take first line or truncate.
            artist = artist.split('\n')[0][:190]

            return Slika(
                slika=get_image_url(art_data['image_id']),
                thumbnail=get_image_url(art_data['image_id'], 400),
                naslov=naslov,
                opis=clean_desc,
                fotograf=artist,
                datum_otpremanja=datetime.utcnow(),
                istaknuta=istaknuta,
                naslovna=naslovna, # Biće overridovano kasnije ili postavljeno ovde
                redosled=order
            )

        for i, q in enumerate(queries):
            res = fetch_artic_artwork(q, 1)
            art_data = res[0] if res else None
            # Logika iz starog fajla:
            # Slike 0, 1, 2 su bile istaknute
            # Slika 0 je bila naslovna? Original: slike[0].naslovna=True, slike[1].naslovna=False...
            # Ali "naslovna" se koristi za homepage verovatno.
            
            slike.append(create_slika_obj(
                art_data,
                order=i+1,
                istaknuta=(i < 3),
                naslovna=(i == 0)
            ))
            
        db.add_all(slike)
        db.commit()
        print(f"✓ Kreirano {len(slike)} osnovnih slika iz Artic API")
        
        today = date.today()
        
        # Kreiranje izložbi koristeći fetchovane slike
        # Indeksi moraju da ostanu isti kao u originalu da bi odgovarali temama
        
        izlozbe = [
            Izlozba(
                naslov="Van Gogh: Boje emocija",
                slug="van-gogh-boje-emocija",
                opis="Ekskluzivna retrospektiva Van Goghovih dela, fokusirana na njegov period u Arlu.",
                kratak_opis="Ekskluzivna retrospektiva Van Goghovih dela",
                datum_pocetka=date(2026, 1, 19),
                datum_zavrsetka=date(2026, 4, 19),
                id_lokacija=lokacije[0].id_lokacija,
                kapacitet=100,
                osmislio="Dr Sofija Radovanović",
                aktivan=True,
                objavljeno=True,
                thumbnail=slike[3].thumbnail,
                id_slika=slike[3].id_slika,
                datum_kreiranja=datetime.utcnow()
            ),
            Izlozba(
                naslov="Impresionizam i neoimpresionizam",
                slug="impresionizam-i-neoimpresionizam",
                opis="Od Monea do Seurata - evolucija svetlosti u slikarstvu.",
                kratak_opis="Od Monea do Seurata - evolucija svetlosti u slikarstvu",
                datum_pocetka=date(2025, 12, 27),
                datum_zavrsetka=date(2026, 3, 20),
                id_lokacija=lokacije[1].id_lokacija,
                kapacitet=200,
                osmislio="Prof. Ana Nikolić",
                aktivan=True,
                objavljeno=True,
                thumbnail=slike[1].thumbnail,
                id_slika=slike[1].id_slika,
                datum_kreiranja=datetime.utcnow()
            ),
            Izlozba(
                naslov="Američki realizam XX veka",
                slug="americki-realizam-20-veka",
                opis="Istraživanje američkog realizma kroz ikonična dela XX veka.",
                kratak_opis="Istraživanje američkog realizma kroz ikonična dela XX veka",
                datum_pocetka=date(2025, 12, 20),
                datum_zavrsetka=date(2026, 2, 18),
                id_lokacija=lokacije[0].id_lokacija,
                kapacitet=150,
                osmislio="Kustos Marko Petrović",
                aktivan=True,
                objavljeno=True,
                thumbnail=slike[2].thumbnail,
                id_slika=slike[2].id_slika,
                datum_kreiranja=datetime.utcnow()
            ),
            Izlozba(
                naslov="Apstraktna Harmonija",
                slug="apstraktna-harmonija",
                opis="Putovanje kroz istoriju apstraktne umetnosti. Kandinsky i njegova revolucija oblika i boja.",
                kratak_opis="Putovanje kroz istoriju apstraktne umetnosti",
                datum_pocetka=date(2026, 2, 15),
                datum_zavrsetka=date(2026, 5, 15),
                id_lokacija=lokacije[1].id_lokacija,
                kapacitet=120,
                osmislio="Dr Ivan Savić",
                aktivan=True,
                objavljeno=True,
                thumbnail=slike[4].thumbnail,
                id_slika=slike[4].id_slika,
                datum_kreiranja=datetime.utcnow()
            ),
            Izlozba(
                naslov="Nadrealizam u fokusu",
                slug="nadrealizam-u-fokusu",
                opis="Istražite snove i podsvest kroz dela Salvadora Dalija i drugih nadrealista.",
                kratak_opis="Snovi i podsvest kroz dela nadrealista",
                datum_pocetka=date(2026, 3, 10),
                datum_zavrsetka=date(2026, 6, 10),
                id_lokacija=lokacije[0].id_lokacija,
                kapacitet=180,
                osmislio="Kustos Jelena M.",
                aktivan=True,
                objavljeno=True,
                thumbnail=slike[5].thumbnail,
                id_slika=slike[5].id_slika,
                datum_kreiranja=datetime.utcnow()
            ),
            Izlozba(
                naslov="Fotografija Niškog kraja",
                slug="fotografija-niskog-kraja",
                opis="Ekskluzivna izložba.",
                kratak_opis="Otkrijte lepotu Niša kroz objektiv lokalnih fotografa",
                datum_pocetka=date(2026, 2, 1),
                datum_zavrsetka=date(2026, 4, 30),
                id_lokacija=lokacije[3].id_lokacija,
                kapacitet=100,
                osmislio="Kustos Milena Jovanović",
                aktivan=True,
                objavljeno=True,
                thumbnail=slike[6].thumbnail,
                id_slika=slike[6].id_slika,
                datum_kreiranja=datetime.utcnow()
            ),
            Izlozba(
                naslov="Industrijsko Nasleđe Šumadije",
                slug="industrijsko-nasledje-sumadije",
                opis="Dokumentacija industrijskog razvoja.",
                kratak_opis="Industrijsko nasleđe regiona",
                datum_pocetka=date(2026, 1, 15),
                datum_zavrsetka=date(2026, 3, 15),
                id_lokacija=lokacije[4].id_lokacija,
                kapacitet=80,
                osmislio="Dr Aleksandar Nikolić",
                aktivan=True,
                objavljeno=True,
                thumbnail=slike[0].thumbnail,
                id_slika=slike[0].id_slika,
                datum_kreiranja=datetime.utcnow()
            )
        ]
        
        db.add_all(izlozbe)
        db.commit()
        
        # Preuzimanje dodatnih slika za galeriju (random mix)
        print("Preuzimanje dodatnih slika za galerije...")
        extra_artworks = fetch_artic_artwork("artwork", 30)
        
        if not extra_artworks:
            print("Upozorenje: Nisu pronađene dodatne slike.")
        
        for i, izlo in enumerate(izlozbe):
            # Odaberi 2 slike iz bazena za svaku izložbu
            if extra_artworks:
                art1 = extra_artworks[(i * 2) % len(extra_artworks)]
                art2 = extra_artworks[(i * 2 + 1) % len(extra_artworks)]
            else:
                art1, art2 = None, None

            dodatne_slike = [
                 create_slika_obj(art1, order=10 + i) if art1 else Slika(
                     slika="https://via.placeholder.com/1000",
                     thumbnail="https://via.placeholder.com/400",
                     naslov=f"Eksponat A",
                     id_izlozba=izlo.id_izlozba
                 ),
                 create_slika_obj(art2, order=11 + i) if art2 else Slika(
                     slika="https://via.placeholder.com/1000",
                     thumbnail="https://via.placeholder.com/400",
                     naslov=f"Eksponat B",
                     id_izlozba=izlo.id_izlozba
                 )
            ]
            # Set foreign key
            for ds in dodatne_slike:
                ds.id_izlozba = izlo.id_izlozba
                
            db.add_all(dodatne_slike)
        
        db.commit()
        print("✓ Izložbe kreirane")
        
        print("\n" + "="*50)
        print("Test podaci uspešno kreirani (koristeći Artic API)!")
        print("="*50)
        print("\nKorisnički nalozi:")
        print("  Admin:    admin / admin123")
        print("  Korisnik: marko / marko123")
        print("="*50)
        
    except Exception as e:
        print(f"Greška: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
