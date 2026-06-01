# DentApp — RIZIS Field Mapping (Pravilnik o e-kartonu, Sl. glasnik RS 45/2025)

Referentni dokument za buduću RIZIS API integraciju.  
Primena pravilnika: **1. januar 2026.**  
Poslednje ažurirano: 2026-06-01

---

## Napomene

- **Status: implemented** — polje postoji u DB i popunjava se u aplikaciji
- **Status: schema-only** — polje postoji u DB, UI za unos još nije napravljen
- **Status: deferred** — polje nije u DentApp scopu (centralni RIZIS registri)
- **RIZIS API integracija nije implementirana** — ovaj dokument je priprema za nju

---

## Član 3 — Identifikacioni podaci pacijenta

| RIZIS polje | DentApp tabela | Kolona | Status | Napomena |
|---|---|---|---|---|
| JMBG | `patients` | `jmbg` | schema-only | char(13), UNIQUE per clinic, nullable; UI ne zahteva obavezno unos za MVP |
| EBS (strani državljani) | `patients` | `ebs` | schema-only | varchar, UNIQUE per clinic, nullable |
| Lični broj osiguranika | `patients` | `lbo` | schema-only | varchar, nullable |
| Broj stomatološkog kartona | `patients` | `broj_kartona` | implemented | Auto-generisan: [PREFIX]-[YYYY]-[NNNNN] via Postgres trigger |
| Donorska kartica | `patients` | `donor_card` | schema-only | boolean, default false |
| Telefon | `patients` | `phone` | implemented | — |
| Email | `patients` | `email` | implemented | — |

**Napomena za export:** Prenos u RIZIS se vrši po JMBG ili EBS (Čl. 7). Export layer mora filtrirati pacijente koji nemaju ni JMBG ni EBS.

---

## Član 4, tačka 1 — Osnovni zdravstveni podaci (po poseti)

| RIZIS polje | DentApp tabela | Kolona | Status | Napomena |
|---|---|---|---|---|
| Matični broj pravnog lica | `clinics` | `maticni_broj` | schema-only | Razlika od PIB-a (tax_id); mora se uneti u podešavanjima klinike |
| Organizaciona jedinica | `clinics` | `organizaciona_jedinica` | schema-only | Nullable |
| JMBG zdravstvenog radnika | `profiles` | `jmbg` | schema-only | char(13), UNIQUE globally, nullable |
| JMBG/EBS pacijenta | `patients` | `jmbg` / `ebs` | schema-only | Vidi napomenu iznad |
| Tip lečenja | `appointments` | `appointment_type` | partial | Vrednosti: regular/urgent/followup/consultation/specialist; potrebno mapiranje u RIZIS tipove |
| Datum pružanja usluge | `visits` | `visit_date` | implemented | DATE format, ISO 8601 |
| Dijagnoza — MKB-10 šifra | `visits` | `dijagnoza_mkb` | schema-only | varchar(10), nullable; UI za unos MKB šifre nije implementiran za MVP |
| Dijagnoza — slobodan opis | `visits` | `diagnosis` | implemented | Slobodan tekst, koristiti kao `dijagnoza_opis` u RIZIS exportu |
| Usluga/procedura | `visit_procedures` | `description` + `service_id` | implemented | description za slobodan tekst; service_id linkuje na cenovnik |
| Zub — oznaka (FDI) | `visit_procedures` | `tooth_fdi` | implemented | FDI nomenklatura, npr. '36' |
| Zub — status | `odontogram_teeth` | `status` | implemented | Vrednosti: healthy/decayed/filled/crowned/missing/implant/bridge/root_canal/to_extract/extracted/other |
| Zub — sanacija | `visit_procedures` | `description` | partial | Slobodan opis tretmana; strukturovano mapiranje u RIZIS šifre je deferred |
| Uslugu pružio (doktor) | `visits` | `doctor_id` → `profiles.jmbg` | partial | doctor_id postoji, ali JMBG doktora mora biti popunjen za RIZIS |
| Usluga na terenu | `visits` | `usluga_na_terenu` | schema-only | boolean, default false |
| Usluga pružena invalidnom licu | `visits` | `usluga_invalidnom_licu` | schema-only | boolean, default false |

---

## Član 4, tačka 2 — Alergijska reakcija (strukturovano)

| RIZIS polje | DentApp tabela | Kolona | Status | Napomena |
|---|---|---|---|---|
| Matični broj pravnog lica | `clinics` | `maticni_broj` | schema-only | Vidi iznad |
| JMBG zdravstvenog radnika | `patient_allergies` | `recorded_by` → `profiles.jmbg` | partial | recorded_by postoji; JMBG doktora mora biti popunjen |
| JMBG/EBS pacijenta | `patient_allergies` | `patient_id` → `patients.jmbg/ebs` | partial | patient_id postoji; JMBG/EBS pacijenta mora biti popunjen |
| Agens | `patient_allergies` | `agens` | schema-only | Slobodan tekst agensa |
| Šifra leka — ATC | `patient_allergies` | `atc_sifra_leka` | schema-only | varchar(15), nullable |
| Naziv leka — INN | `patient_allergies` | `naziv_leka_inn` | schema-only | varchar(255), nullable |
| Oblik alergijske reakcije | `patient_allergies` | `oblik_reakcije` | schema-only | Slobodan tekst |
| Alergen | `patient_allergies` | `alergen` | schema-only | Slobodan tekst |
| Vrsta alergijske reakcije | `patient_allergies` | `vrsta_alergijske_reakcije` | schema-only | Slobodan tekst |
| Datum alergijske reakcije | `patient_allergies` | `datum_alergijske_reakcije` | schema-only | DATE, nullable |

**Napomena:** Postojeći free-text podaci iz `patient_medical_records.allergies text[]` su migrirani u `patient_allergies.agens`. ATC šifre i ostala strukturovana polja treba ručno dopuniti.

---

## Registar resursa (zdravstveni radnici — dolazi iz RIZIS-a, mi šaljemo lokalno)

| RIZIS polje | DentApp tabela | Kolona | Status | Napomena |
|---|---|---|---|---|
| JMBG/EBS zdravstvenog radnika | `profiles` | `jmbg` | schema-only | char(13), UNIQUE globally |
| Ime | `profiles` | `first_name` | implemented | — |
| Prezime | `profiles` | `last_name` | implemented | — |
| Pol | `profiles` | — | deferred | Ne vodimo u profilima |
| Vrsta licence | `profiles` | `status_licence` | schema-only | — |
| Broj licence | `profiles` | `broj_licence` | schema-only | varchar(30) |
| Datum sticanja/obnavljanja licence | `profiles` | `datum_licence` | schema-only | DATE |
| Status licence | `profiles` | `status_licence` | schema-only | varchar(30) |
| Datum važenja licence | `profiles` | `datum_vazenja_licence` | schema-only | DATE |
| Specijalizacija | `profiles` | `specialty` | implemented | Slobodan tekst; mapiranje u RIZIS šifre je deferred |
| Uža specijalizacija | `profiles` | `uza_specijalizacija` | schema-only | varchar(100) |
| Email | `profiles` | — | deferred | Supabase auth email, ne u profiles tabeli |
| Kontakt telefon | `profiles` | `phone` | implemented | — |

---

## Polja iz centralnih RIZIS registara (ne šaljemo mi, primamo)

Sledeća polja RIZIS popunjava iz sopstvenih registara na osnovu JMBG-a.  
DentApp ih **NE mora čuvati** lokalno (RIZIS je izvor), ali može keširate za prikaz:

| RIZIS polje | Status u DentApp |
|---|---|
| Prezime, ime, pol, datum/mesto rođenja | Čuvamo lokalno (patients tabela) |
| Podaci o roditeljima | deferred (nije relevantno za stomatologiju) |
| Bračno stanje | deferred |
| Adresa prebivališta | Čuvamo parcijalno (address, city) |
| Zanimanje | deferred |
| Zdravstveno osiguranje (status, osnov, datum) | deferred — lbo se čuva, ostalo deferred |
| Elektronski recept | deferred (posebna integracija) |
| Elektronski izveštaj o hospitalizaciji | deferred |
| Registar imunizovanih lica | deferred |
| Registar laboratorijskih nalaza | deferred |
| Portal pacijenta | deferred (pacijentski interfejs nije u MVP-u) |

---

## Audit pokrivenost

| Entitet | Polje | Audit trigger | Status |
|---|---|---|---|
| `patients` | `jmbg`, `ebs`, `broj_kartona` | `audit_patients_sensitive_fields` | implemented |
| `visits` | `dijagnoza_mkb` | `audit_visits_mkb` | implemented |
| `patient_allergies` | sva polja (CUD) | `audit_patient_allergies` | implemented |

---

## Šta nedostaje za punu RIZIS integraciju (post-MVP)

1. **RIZIS API klijent** — Edge Function za slanje podataka (Čl. 5, 6, 8, 9)
2. **LZB (Lični zdravstveni broj)** — RIZIS ga dodeljuje, mi ga ne generišemo; treba kolona `patients.lzb`
3. **UI za unos JMBG/EBS** — polja postoje u DB, formi za pacijente treba dodati
4. **UI za unos MKB-10 šifre** — autocomplete ili dropdown sa MKB-10 tabelom; potrebna MKB-10 referentna tabela
5. **UI za licence doktora** — forma u podešavanjima
6. **Mapiranje appointment_type u RIZIS tip lečenja** — standardizovana enum vrednost
7. **Queue za retransfer** — 24h SLA za slanje po Čl. 6; treba outbox tabela
8. **LZB konverzija** — JMBG → LZB mora ići kroz poseban RIZIS servis (Čl. 6)
9. **Pacijenti bez JMBG** — tok za pacijente koji nemaju JMBG na prvoj poseti
10. **Forma za unos matičnog broja klinike** — kritično za RIZIS identifikaciju

---

## Mapiranje status vrednosti (DentApp → RIZIS)

> **Napomena:** RIZIS enum vrednosti nisu poznate do objave tehničke dokumentacije.  
> Ovo mapiranje je pretpostavljeno i mora biti verifikovano.

| DentApp (appointment_type) | Pretpostavljeni RIZIS tip lečenja |
|---|---|
| `regular` | ambulantno |
| `urgent` | hitno |
| `followup` | kontrola |
| `consultation` | konsultacija |
| `specialist` | specijalista |

| DentApp (odontogram_teeth.status) | Pretpostavljeni RIZIS zub status |
|---|---|
| `healthy` | zdrav |
| `decayed` | karijesan |
| `filled` | plomba |
| `crowned` | kruna |
| `missing` | nedostaje |
| `implant` | implantat |
| `bridge` | most |
| `root_canal` | devitalan (endodontski lečen) |
| `to_extract` | za ekstrakciju |
| `extracted` | ekstrahovan |
