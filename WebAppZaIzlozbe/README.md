#  Web Aplikacija za Izložbe Fotografija

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61dafb)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

Moderna full-stack aplikacija za upravljanje i pregled umetničkih izložbi. Sistem omogućava korisnicima istraživanje kulturnih događaja, dok organizatorima pruža moćne alate za administraciju.

---

## Ključne Funkcionalnosti

### Za Korisnike
*   **Istraživanje:** Pregled aktuelnih i predstojećih izložbi sa detaljnim opisima i kustosima.
*   **Rezervacije:** Jednostavan sistem rezervacije karata za željene izložbe.
*   **QR Ulaznice:** Automatsko generisanje QR kodova za svaku potvrđenu rezervaciju.
*   **Statistike:** Pregled istorijata prijava.
### Za Administraciju
*   **CMS:** Kompletan sistem za dodavanje, izmenu i brisanje (CRUD) izložbi.
*   **Media Management:** Direktno otpremanje slika.

---

## Tehnološki Stack

| Komponenta | Tehnologija |
| :--- | :--- |
| **Backend** | FastAPI (Python 3.10+), SQLAlchemy (ORM), Pydantic |
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Baza podataka** | PostgreSQL 15 |
| **Migracije** | Alembic |
| **Kontejneri** | Docker & Docker Compose |

---

## Relacioni model

*   **Korisnici** (id_korisnik [PK], username, email, lozinka, ime, prezime, telefon, profilna_slika, grad, adresa, aktivan, super_korisnik, datum_pridruzivanja, poslednja_prijava)
*   **Izlozbe** (id_izlozba [PK], id_slika [FK], id_lokacija [FK], naslov, slug, opis, kratak_opis, datum_pocetka, datum_zavrsetka, kapacitet, thumbnail, osmislio, aktivan, objavljeno, datum_kreiranja, datum_izmene)
*   **Slike** (id_slika [PK], id_izlozba [FK], slika, thumbnail, naslov, opis, fotograf, datum_otpremanja, istaknuta, naslovna, redosled)
*   **Prijave** (id_prijava [PK], id_korisnik [FK], id_izlozba [FK], id_slika [FK], broj_karata, qr_kod, validirano, datum_registracije, slika_qr, verifikovan_email, email_poslat, datum_slanja_emaila)
*   **Lokacije** (id_lokacija [PK], naziv, opis, g_sirina, g_duzina, adresa, grad)


---

## Brzo Pokretanje

Najlakši način da pokrenete projekat lokalno je kroz Docker.

### 1. Podizanje Servisa
U korenu projekta pokrenite:
```bash
docker-compose up -d --build
```

### 2. Inicijalizacija Podataka (Seed)
Nakon što se kontejneri podignu, popunite bazu testnim podacima (izložbe, slike, lokacije):
```bash
docker exec -it izlozbe_backend python seed_data.py
```

---

## Testni Nalozi

Za potrebe testiranja aplikacije, koristite sledeće akreditive:

| Uloga | Username | Password |
| **Administrator** | `admin` | `admin123` |
| **Običan korisnik** | `marko` | `marko123` |

---

## Uloge i Premise

| Uloga | Dozvoljene funkcije | Ograničenja | Prava pristupa |
| :---  |    :---             |     :---    | :--- |
| **Gost** | Pregled izložbi, registracija | Ne može pristupiti profilu. Ne može se prijaviti na izložbu. Ne može upravljati izložbama, fotografijama i korisnicima | Samo javni podaci |
| **Korisnik** | Pregled izložbi, prijava na izložbe, upravljanje profilom | Ne može upravljati izložbama, fotografijama i korisnicima | Privatni i javni podaci |
| **Administrator** | Upravljanje svim izložbama, fotografijama. Korisnicima, pregled izložbi, prijava na izložbe, upravljanje profilom | x | Svi podaci |

---

## Mrežne Adrese

| Servis | URL | Opis |
| **Frontend** | [http://localhost:80](http://localhost:80) | Glavni UI aplikacije |
| **API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger dokumentacija |
| **PgAdmin** | [http://localhost:5050](http://localhost:5050) | GUI za bazu (admin@admin.com / admin) |

---

## Struktura Projekta

*   `backend/` - FastAPI aplikacija, modeli baze, API rute i logika za upload.
*   `frontend/` - React aplikacija sa modernim komponentama i Tailwind stilizacijom.
*   `docker-compose.yml` - Definicija orkestracije svih servisa.

---

# Projekat je razvijen od strane: 
Jordanović Marko 2022/1078
Dimitrijević Stefan 2022/1084
Živković Vanja 2021/0244
Projekat je razvijen u okviru predmeta Internet Tehnologije 2025/2026.