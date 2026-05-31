# DentApp — Project Brief za Claude Code

## Šta se gradi

DentApp je dental practice management aplikacija naredne generacije, dizajnirana oko AI agenata.

Za razliku od klasičnih dental aplikacija gde korisnik klikće kroz forme, DentApp je zamišljen kao sistem gde AI agent obavlja veći deo operativnog posla — čita kontekst, predlaže akcije, izvršava zadatke na zahtev, i vodi korisnike kroz workflow.

Cilj nije samo digitalizovati papir. Cilj je da ordinacija funkcioniše pametnije uz minimalnu manuelnu interakciju.

---

## Ko koristi aplikaciju

### Primarne persone

**Doktor/Specijalista**
- Gleda raspored dana
- Otvara karton pacijenta pre ili tokom pregleda
- Diktira ili kuca napomene u toku ili posle posete
- Pita AI agenta za kontekst: "Šta smo radili prošli put sa ovim pacijentom?"
- Završava posetу i beleži urađene usluge

**Recepcija / Admin**
- Zakazuje i menja termine
- Prima pacijente (arrival workflow)
- Beleži uplate
- Odgovara na pitanja o rasporedu i dugovanjima

**Vlasnik / Menadžer ordinacije**
- Vidi preglede, izveštaje, provizije doktora
- Upravlja uslugama, cenovnikom, timom
- Vidi finansijski status ordinacije

**Asistent / Tehničar**
- Priprema materijale
- Prati raspored
- Kreira zahteve za materijale

### Buduća persona (nije MVP)
- **Pacijent** — zakazivanje putem AI agenta, pregled kartona, podsetnici

---

## Ključna razlika od konkurencije

1. **AI agent kao primarni interfejs** — korisnik govori ili kuca, agent razume i deluje
2. **Voice interface** — mandatorno za finalni proizvod, priprema za MVP
3. **Proaktivni agent** — predlaže follow-up, upozorava na dugovanja, prepoznaje obrasce
4. **Multi-tenant od starta** — više ordinacija, izolovani podaci, konfigurabilno po klinici
5. **Srpski jezik / regionalni kontekst** — terminologija i workflow prilagođeni tržištu

---

## MVP Scope

MVP se fokusira na četiri oblasti:

1. **Planer / Kalendar** — dnevni i nedeljni prikaz termina, upravljanje zakazivanjem
2. **Kartoni pacijenata** — profil, anamneza, odontogram, istorija poseta
3. **Visit Workflow** — prijem pacijenta → pregled → beleženje urađenog → završetak posete
4. **AI Agent Layer** — chat interfejs uz svaki workflow, read+write actions, proaktivni predlozi

---

## Šta nije MVP

- Finansijski modul (uplate, dugovanja, fakture) — dolazi posle MVP-a
- Provizije doktora — dolazi posle MVP-a
- Inventar i materijali — dolazi posle MVP-a
- Pacijentski portal — dolazi posle MVP-a
- SMS/Viber notifikacije — dolazi posle MVP-a
- Fiskalizacija — dolazi posle MVP-a

---

## Principi projekta

1. **Agent-first** — svaki screen ima AI pristup kao primarnu opciju, ne kao dodatak
2. **Dokumentuj pre kodiranja** — svaka faza ima task dokument pre implementacije
3. **Multi-tenant od starta** — clinic_id u svakoj tabeli, RLS od prvog dana
4. **Srpski jezik u UI** — svi labeli, poruke, i agent odgovori na srpskom
5. **Supabase lokalno za development** — Docker container, bez cloud dependency tokom dev-a
6. **Fake/demo podaci** — nikada pravi pacijentski podaci tokom razvoja
7. **Inkrementalno** — jedan modul u potpunosti pre sledećeg
