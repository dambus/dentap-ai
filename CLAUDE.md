# CLAUDE.md — DentApp Instrukcije za Claude Code

Ovaj fajl je primarna referenca za Claude Code u ovom projektu.
Uvek pročitaj ovaj fajl pre nego što počneš sa radom.

---

## O Projektu

DentApp je dental practice management aplikacija sa AI agentima kao primarnim interfejsom.
Cilj MVP-a: Planer + Kartoni pacijenata + Visit workflow + AI agent layer.

Cela dokumentacija je u `/docs/` folderu.

---

## Stack

- React 18 + Vite + TypeScript (strict mode)
- Tailwind CSS v3
- TanStack Query v5 za server state
- Zustand za client state (minimalno)
- Supabase (lokalni Docker za dev)
- Supabase Edge Functions sa Anthropic SDK

---

## Pravila Kodiranja

### TypeScript
- Strict mode uvek uključen
- Nema `any` — koristi `unknown` sa type guard-ima
- Sve komponente imaju eksplicitne prop tipove (interface, ne type za Props)
- Async funkcije uvek imaju try/catch

### Imenovanje
- Komponente: PascalCase (`PatientCard.tsx`)
- Hooks: `use` prefix (`usePatients.ts`)
- Utils: camelCase (`formatDate.ts`)
- Types: PascalCase interface (`Patient`, `Appointment`)
- Konstante: SCREAMING_SNAKE (`MAX_APPOINTMENT_DURATION`)
- DB kolone: snake_case, TypeScript: camelCase (automatski kroz Supabase types)

### Struktura Komponenti
```typescript
// 1. Imports (react, libraries, local)
// 2. Types/Interfaces
// 3. Konstante
// 4. Komponenta
// 5. Export
```

### UI Tekst
- Sav tekst u UI je srpski
- Koristiti srpsku latinicu (ne ćirilicu za MVP)
- Datumi: `date-fns/locale/sr` format
- Vreme: 24h format (13:30, ne 1:30 PM)

---

## Baza Podataka

- Lokalni Supabase: `supabase start`
- Studio: `http://localhost:54323`
- Reset i reseed: `supabase db reset`
- Migracije: samo kroz fajlove u `supabase/migrations/`
- Nikad ne menjaj bazu direktno kroz Studio (osim za debugging)

### Supabase Tipovi
Generiši tipove posle svake migracije:
```bash
supabase gen types typescript --local > src/types/database.types.ts
```

---

## Supabase Edge Functions

Lokalno testiranje:
```bash
supabase functions serve agent --env-file .env.local
```

Svaka funkcija mora:
1. Verifikovati JWT (`Authorization: Bearer <token>`)
2. Dohvatiti `clinic_id` iz JWT
3. Koristiti service role samo za operacije koje zahtevaju admin pristup
4. Logovati greške bez izlaganja sensitive podataka

---

## AI Agent

- Model: `claude-sonnet-4-5`
- API key u `.env.local` kao `ANTHROPIC_API_KEY`
- Nikad ne čuvaj API key u kodu ili git-u
- Sve tool definicije u `supabase/functions/agent/tools.ts`
- System prompt u `supabase/functions/agent/system-prompt.ts`

---

## Zabranjeno

- Pravi pacijentski podaci u development-u (koristi seed/demo podatke)
- `console.log` u produkcijskom kodu
- Direct SQL upiti koji zaobilaze RLS
- Hardcoded clinic_id ili user_id
- Frontend-only auth provere (mora biti i backend)
- `any` TypeScript tip
- Commit sa `TODO:` koji blokira funkcionalnost

---

## Git Konvencije

```
feat: dodaj dnevni prikaz planera
fix: ispravi pretragu pacijenata
chore: update zavisnosti
docs: ažuriraj task 005 status
```

Commit posle svakog završenog taska.

---

## Redosled Rada

1. Pročitaj task iz `docs/04_MVP_TASKS.md`
2. Pročitaj relevantne referentne dokumente
3. Implementiraj
4. Verifikuj prihvatanje kriterijume
5. Commit
6. Javi status

---

## Demo Kredencijali (lokalni dev)

```
Dr. Ana Petrović (owner/doktor):  ana@demo.dentapp.rs / demo1234
Dr. Marko Jovanović (doktor):     marko@demo.dentapp.rs / demo1234
Jelena Nikolić (recepcija):       jelena@demo.dentapp.rs / demo1234
```

Ovi kredencijali se kreiraju kroz `supabase/seed.sql`.
