# DentApp — MVP Task Lista za Claude Code

## Kako koristiti ovaj dokument

Svaki Task je zasebna instrukcija za Claude Code.
Nemoj preskakati taskove. Svaki task pretpostavlja da je prethodni završen i testiran.
Pre svakog taska, pročitaj relevantne dokumente iz `/docs` foldera.

---

## FAZA 0 — Inicijalizacija Projekta

### Task 001 — Kreiranje Repo Strukture i Inicijalizacija

**Cilj:** Prazan ali funkcionalan projekat koji se pokreće lokalno.

**Šta uraditi:**
1. Inicijalizuj Vite + React + TypeScript projekat
2. Instaliraj i konfiguriši Tailwind CSS v3
3. Instaliraj zavisnosti: `react-router-dom`, `@tanstack/react-query`, `zustand`, `lucide-react`, `date-fns`, `@supabase/supabase-js`
4. Inicijalizuj Supabase lokalno (`supabase init`, konfiguriši `config.toml`)
5. Kreiraj `.env.local` template sa potrebnim varijablama
6. Postavi osnovnu folder strukturu:
   ```
   src/agent/, src/components/ui/, src/components/layout/
   src/features/appointments/, src/features/patients/
   src/features/visits/, src/features/settings/
   src/lib/, src/types/, src/pages/
   supabase/migrations/, supabase/functions/
   docs/
   ```
7. Kopiraj sve dokumente iz `/docs` u repo `docs/` folder
8. Verifikuj da `npm run dev` i `supabase start` rade

**Prihvatanje:** `npm run dev` otvara prazan app, `supabase start` prikazuje lokalni Studio URL.

---

### Task 002 — Design System i UI Primitivi

**Cilj:** Osnovna vizuelna identifikacija i reusable komponente.

**Estetika:**
- Primarno bela i slate-50 pozadina
- Akcentna boja: `#0B6E6E` (deep teal) — pouzdana, medicinska
- Tipografija: Google Fonts — `DM Sans` za UI, `DM Mono` za kodove/vrednosti
- Border radius: `rounded-md` (8px) standardno, `rounded-lg` (12px) za kartice
- Shadow: minimalne, samo za floating elemente

**Komponente za kreirati:**
```
Button (variant: primary, secondary, ghost, danger; size: sm, md, lg)
Input (sa label, error state, icon prefix/suffix)
Textarea
Select
Badge (variant: success, warning, danger, neutral, info; + status-specific)
Card (sa opcionalnim headerom i footerorm)
Avatar (inicijali ili slika, size: sm, md, lg)
Spinner (loading indicator)
Modal (sa Radix Dialog primitiv)
Tooltip (Radix)
Dropdown / ContextMenu (Radix)
Separator
```

**Tailwind konfiguriši sa:**
```javascript
// tailwind.config.js
colors: {
  teal: { 50:'#f0fafa', 100:'#ccefef', ..., 600:'#0B6E6E', 700:'#095a5a' },
  slate: { /* default */ }
}
fontFamily: {
  sans: ['DM Sans', 'sans-serif'],
  mono: ['DM Mono', 'monospace']
}
```

**Prihvatanje:** Storybook nije potreban. Napravi `src/pages/DevKitchen.tsx` sa svim komponentama prikazanim na jednoj stranici za vizuelni pregled.

---

### Task 003 — Inicijalna Migracija Baze i Seed Podaci

**Cilj:** Kompletan schema koji radi lokalno sa demo podacima.

**Šta uraditi:**
1. Napiši migraciju `20250601000000_initial_schema.sql` koristeći schema iz `docs/02_DATABASE_SCHEMA.md`
2. Napiši RLS politike migraciju `20250601000001_rls_policies.sql`
3. Napiši seed `supabase/seed.sql` koji kreira:
   - 1 demo kliniku: "Demo Stomatološka Ordinacija"
   - 3 demo korisnika:
     - Dr. Ana Petrović (doktor, owner)
     - Dr. Marko Jovanović (doktor)
     - Jelena Nikolić (recepcija)
   - 10 demo pacijenata sa različitim podacima (bez JMBG-a)
   - 5 demo termina za danas i sutra
   - 3 demo posete (completed)
   - Nekoliko demo procedura i planova lečenja
   - Demo cenovnik (10-15 usluga)
4. Verifikuj seed kroz Supabase Studio

**Prihvatanje:** `supabase db reset` uspešno resetuje i seeduje bazu. Studio prikazuje podatke.

---

### Task 004 — Auth Flow i App Shell

**Cilj:** Korisnik može da se uloguje i vidi osnovni layout sa navigacijom.

**Šta uraditi:**
1. Login stranica (email + password, srpski tekst)
2. Supabase Auth integracija sa klijentom
3. Protected route wrapper
4. App shell layout:
   - Sidebar (levi, fiksiran, 240px)
     - Logo/naziv klinike
     - Navigacija: Planer, Pacijenti, Posete, Podešavanja
     - User info (avatar, ime) na dnu
   - Glavni sadržaj (fluid)
   - Agent panel placeholder (desni, collapsible, 320px) — samo bok, sadržaj dolazi kasnije
5. Route setup:
   - `/login` → LoginPage
   - `/` → redirect na `/planer`
   - `/planer` → PlanerPage (placeholder)
   - `/pacijenti` → PacijentiPage (placeholder)
   - `/pacijenti/:id` → PacijentPage (placeholder)
   - `/posete/:id` → PoseetPage (placeholder)
   - `/podesavanja` → PodesavanjaPage (placeholder)
6. Čuvanje session-a, logout

**Prihvatanje:** Korisnik se uloguje sa demo kredencijalima, vidi sidebar, može da navigira između placeholder stranica.

---

## FAZA 1 — Planer i Kalendar

### Task 005 — Planer: Dnevni Prikaz

**Cilj:** Doktor vidi sve termine za izabrani dan.

**Šta uraditi:**
1. `PlanerPage` sa date picker-om (prethodan/sledeći dan, klik na datum)
2. Dnevni prikaz:
   - Vertikalna osa: vreme (07:00 – 20:00), mrežaste linije na svakih 30min
   - Termini prikazani kao kartice u kolonama po doktoru
   - Kartica termina prikazuje: vreme, ime pacijenta, tip termina, status badge
   - Boja kartice prema doktoru (korisnikov color iz profiles)
3. Filter po doktoru (owner vidi sve, doktor vidi samo sebe po defaultu)
4. Responsive: na tablet-u horizontalni scroll za višestruke doktore
5. Loading state

**Prihvatanje:** Dnevni prikaz sa demo terminima. Navigacija između dana radi.

---

### Task 006 — Planer: Nedeljni Prikaz

**Cilj:** Pregled cele nedelje.

**Šta uraditi:**
1. Toggle između dnevnog i nedeljnog prikaza
2. Nedeljni prikaz: 7 kolona (po jedan dan), termini minimizirani
3. Klik na termin u nedeljnom prikazu → detalji u panelu ili navigacija na dnevni prikaz tog dana
4. Highlight današnjeg dana

**Prihvatanje:** Nedeljni i dnevni prikaz se prebacuju. Demo termini vidljivi.

---

### Task 007 — Zakazivanje Termina (Modal)

**Cilj:** Recepcija ili doktor mogu da zakažu novi termin.

**Šta uraditi:**
1. "Novi termin" dugme u planeru
2. Modal za zakazivanje:
   - Pretraga i izbor pacijenta (autocomplete)
   - Izbor doktora
   - Datum i vreme (date + time picker)
   - Trajanje (15/30/45/60/90/120 min)
   - Tip termina (redovan, hitan, kontrola, konsultacija)
   - Napomena
3. Klik na slobodan slot u planeru → otvara modal sa pre-popunjenim vremenom
4. Validacija (ne može u prošlost, ne može da se preklapa)
5. Optimistic update u UI

**Prihvatanje:** Novi termin se kreira i pojavljuje u planeru bez reload-a.

---

### Task 008 — Operativni Workflow Termina

**Cilj:** Recepcija/doktor menja operativni status termina tokom dana.

**Šta uraditi:**
1. Klik na termin → detalji panel (desno ili modal)
2. Akcije prema statusu:
   - `not_arrived` → "Pacijent stigao" dugme
   - `arrived` → "Uvesti pacijenta" dugme
   - `in_chair` → "Počni posetу" dugme → kreira Visit, navigira na Visit screen
   - `scheduled` → "Otkaži" (sa razlogom), "No-show"
3. Badge u kartici se ažurira odmah
4. Detalji panela: ime, telefon, napomena, status, akcije

**Prihvatanje:** Kompletan operativni flow termina radi za demo pacijente.

---

## FAZA 2 — Kartoni Pacijenata

### Task 009 — Lista Pacijenata

**Cilj:** Pretraga i lista pacijenata.

**Šta uraditi:**
1. `PacijentiPage` sa search input-om (real-time pretraga po imenu/telefonu)
2. Tabela/lista pacijenata:
   - Avatar (inicijali), ime i prezime, datum rođenja, telefon, status
   - Klik → navigira na karton pacijenta
3. "Novi pacijent" dugme → modal za kreiranje
4. Paginacija ili infinite scroll
5. Prikazuje "Nema rezultata" state

**Prihvatanje:** Demo pacijenti vidljivi. Pretraga radi. Navigacija na karton radi.

---

### Task 010 — Kreiranje Pacijenta

**Cilj:** Recepcija kreira novog pacijenta.

**Šta uraditi:**
Modal / dedicated page:
- Ime, prezime (obavezno)
- Datum rođenja
- Pol
- Telefon, email, adresa
- Opšta napomena
- Odmah kreira i navigira na karton

**Prihvatanje:** Novi pacijent se kreira i pojavljuje u listi.

---

### Task 011 — Karton Pacijenta: Pregled i Anamneza

**Cilj:** Doktor vidi sve bitne informacije pacijenta na jednom mestu.

**Šta uraditi:**
1. `PacijentPage` sa header-om: ime, starost, telefon, status, medicinska upozorenja (prominentno crveno)
2. Tab navigacija: Pregled | Anamneza | Odontogram | Posete | Plan Lečenja
3. **Tab Pregled:**
   - Medicinska upozorenja (uvek vidljiva)
   - Kontakt info
   - Sledeći termin
   - Poslednja poseta (link)
   - Aktivan plan lečenja (kratak prikaz)
4. **Tab Anamneza:**
   - Forma za uređivanje: alergije (tags), lekovi (tags), sistemske bolesti (tags)
   - Opšta anamneza (textarea)
   - Stomatološka anamneza (textarea)
   - Medicinska upozorenja (textarea, bold/crveno)
   - Inline save (bez posebnog dugmeta za svako polje — debounce ili "Sačuvaj izmene")

**Prihvatanje:** Demo pacijenti imaju predpopunjenu anamnezu koja se može uređivati.

---

### Task 012 — Odontogram

**Cilj:** Grafički prikaz statusa zuba po FDI nomenklaturi.

**Šta uraditi:**
1. SVG odontogram sa 32 zuba (FDI numeracija)
2. Boje/ikone prema statusu: zdrav, karijes, plomba, kruna, nedostaje, implantat, most, devitalan, za vađenje
3. Klik na zub → popup/panel za uređivanje statusa i napomene
4. Gornja i donja vilica, stalna i mlečna denticija toggle (odrasli vs deca)
5. Sačuvaj odmah pri promeni

**Napomena:** Odontogram treba da bude funkcionalan ali ne mora biti savršen vizuelno u prvoj iteraciji. Korisnici će davati feedback.

**Prihvatanje:** Klik na zub, promeni status, vidi se odmah na odontogramu.

---

### Task 013 — Planovi Lečenja

**Cilj:** Doktor kreira i prati plan lečenja pacijenta.

**Šta uraditi:**
1. Tab "Plan Lečenja" na kartonu pacijenta
2. Lista planova (najčešće 1 aktivan)
3. Kreiranje plana:
   - Naziv (auto: "Plan lečenja - {datum}")
   - Dodavanje stavki: opis, zub, usluga iz cenovnika, cena, prioritet
   - Status stavki: planirana, u toku, završena, preskočena
4. Ukupna procenjena vrednost
5. Promena statusa plana: nacrt → predložen → prihvaćen → u toku → završen

**Prihvatanje:** Doktor kreira plan sa stavkama, menja status stavki.

---

## FAZA 3 — Visit Workflow

### Task 014 — Kreiranje i Početak Posete

**Cilj:** Doktor počinje posetу iz termina ili direktno.

**Šta uraditi:**
1. Iz operativnog stanja termina `in_chair` → "Počni posetу" kreira Visit i otvara Visit screen
2. Visit screen header: ime pacijenta, datum, doktor, status (draft/completed)
3. Kratki kontekst pacijenta vidljiv (medicinska upozorenja, poslednja poseta)

**Prihvatanje:** Poseta se kreira iz termina. Visit screen se otvara.

---

### Task 015 — Visit Screen: Beleženje Urađenog

**Cilj:** Doktor beleži šta je urađeno tokom posete.

**Šta uraditi:**
1. **Klinička sekcija:**
   - Razlog dolaska (kratko polje)
   - Kliničke napomene (textarea, auto-save na svake 30s)
   - Dijagnoza (textarea)
2. **Urađene procedure:**
   - Lista urađenih procedura
   - Dodaj proceduru: izbor usluge iz cenovnika, zub (opciono), opis, cena
   - Ukloni proceduru
3. **Link na plan lečenja** (opciono): može da označi stavku plana kao "urađena"

**Prihvatanje:** Doktor može da doda napomene i procedure. Auto-save radi.

---

### Task 016 — Završetak Posete

**Cilj:** Doktor završava posetу i sve se zabeležuje.

**Šta uraditi:**
1. "Završi posetу" dugme
2. Review ekran: pregled svega što je uneto
3. Potvrda → visit status = `completed`, appointment status = `completed`
4. Success state sa opcijama: "Zakaži sledeći termin", "Nazad na planer", "Ostani na kartonu"
5. Završena poseta je read-only (edit nije moguć bez posebne dozvole)
6. Poseta vidljiva u historiji pacijenta (tab Posete na kartonu)

**Prihvatanje:** Kompletni flow od kreiranja do završetka posete radi end-to-end.

---

## FAZA 4 — AI Agent

### Task 017 — Agent Panel UI

**Cilj:** Collapsible agent panel sa chat interfejsom.

**Šta uraditi:**
1. Fiksiran panel sa desne strane (320px)
2. Toggle (strelica ili dugme) za otvaranje/zatvaranje
3. Chat UI:
   - Lista poruka (user/assistant distinction, avatari)
   - Input polje na dnu
   - Send dugme + Enter shortcut
   - Typing indicator (tri tačkice)
   - Scroll na najnoviju poruku
4. Voice input dugme (mikrofon) — Web Speech API, samo za Chrome/Edge, srpski jezik
5. Kontekstualni naslov: "Agent – Planer", "Agent – Ana Marić", itd.
6. Persisted state (Zustand) — panel ostaje otvoren/zatvoren između navigacija

**Prihvatanje:** UI radi. Voice input pretvara govor u tekst u input polju.

---

### Task 018 — Agent Edge Function

**Cilj:** Backend agent koji prima poruke i vraća odgovore.

**Šta uraditi:**
1. Supabase Edge Function `supabase/functions/agent/index.ts`
2. Verifikacija JWT iz Authorization headera
3. Dohvatanje clinic_id i profila iz JWT
4. Sastavljanje system prompta sa kontekstom
5. Definisanje tools (počni sa read-only):
   - `get_today_schedule`
   - `get_patient_summary`
   - `search_patients`
   - `get_available_slots`
6. Poziv Anthropic API (claude-sonnet-4-5)
7. Obrada tool_use → DB upiti → tool_result → finalni odgovor
8. Vraćanje odgovora frontEndu
9. Lokalno testiranje sa `supabase functions serve`

**Prihvatanje:** Agent odgovara na "Ko mi je sledeći pacijent?" i vraća tačan odgovor.

---

### Task 019 — Agent Write Tools i Kontekst

**Cilj:** Agent može da izvršava akcije i svestan je aktuelnog screen-a.

**Šta uraditi:**
1. Dodaj write tools:
   - `create_appointment`
   - `update_appointment_status`
   - `update_visit_notes`
   - `add_visit_procedure`
2. Frontend šalje kontekst uz svaki request (koji screen, koji patient_id itd.)
3. Agent koristi kontekst u system promptu
4. Sve write akcije se loguju u audit_log
5. Agent traži potvrdu pre kreiranja/menjanja: "Da li da zakažem termin za petak u 10:00?"

**Prihvatanje:** "Dodaj karijes na zub 36 za ovog pacijenta" izvršava akciju uz potvrdu.

---

### Task 020 — Proaktivni Agent Predlozi

**Cilj:** Agent samostalno primećuje i predlaže.

**Šta uraditi:**
1. Na otvaranju kartona pacijenta → agent automatski proverava:
   - Medicinska upozorenja (prikazuje ih prominentno)
   - Datum poslednje posete (ako > 6 meseci, predlaže kontrolu)
   - Aktivan plan lečenja (podseća šta je sledeće)
2. Na završetku posete → agent predlaže zakazivanje sledećeg termina
3. Na planeru → agent upozorava na pacijente koji dolaze sa posebnim napomenama
4. Predlozi su dismissible i ne prekidaju workflow

**Prihvatanje:** Otvaranje kartona pacijenta koji nije bio 6+ meseci prikazuje predlog za kontrolu.

---

## FAZA 5 — Podešavanja i Završni Detalji

### Task 021 — Podešavanja Klinike

**Šta uraditi:**
1. `PodesavanjaPage` dostupna samo owner-u
2. Tab: Klinika (naziv, adresa, kontakt)
3. Tab: Tim (lista korisnika, uloge, dodaj korisnika, deaktiviraj)
4. Tab: Cenovnik (lista usluga, dodaj/uredi/deaktiviraj)
5. Tab: Doktori (boje u kalendaru, specijalizacije)

**Prihvatanje:** Owner može da uredi podatke klinike i tim.

---

### Task 022 — Finalni QA i Demo Priprema

**Šta uraditi:**
1. Prođi kroz kompletan workflow: login → planer → zakazi termin → pređi na karton → počni posetu → dodaj procedure → završi posetу → agent interakcija
2. Verifikuj RLS: uloguj se kao Dr. Jovanović i verifikuj da ne vidi tuđe podatke (ako klinika ima izolovane doktore)
3. Responsive provera: desktop (1440px), laptop (1280px), tablet (768px)
4. Loading i error states
5. Popuni seed sa realističnijim demo podacima
6. Napravi demo credentials dokument

**Prihvatanje:** Kompletan demo flow radi bez grešaka.

---

## Redosled Implementacije

```
001 → 002 → 003 → 004
                  ↓
005 → 006 → 007 → 008  (Planer)
                  ↓
009 → 010 → 011 → 012 → 013  (Kartoni)
                              ↓
                  014 → 015 → 016  (Visit)
                              ↓
                  017 → 018 → 019 → 020  (Agent)
                                         ↓
                              021 → 022  (Finalizacija)
```

---

## Napomene za Claude Code

- Pre svakog taska, pročitaj relevantne docs u `/docs/` folderu
- Pišeš TypeScript sa striktnim tipovima, bez `any`
- Sve tekst u UI je srpski
- Koristis `date-fns/locale/sr` za datume
- Svaki API poziv ima loading, success i error state
- Nema `console.log` u produkcijskom kodu, koristi proper error handling
- Commit posle svakog završenog taska sa jasnom porukom
