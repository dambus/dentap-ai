# DentApp — Tech Stack i Arhitektura

## Frontend

| Tehnologija | Verzija | Razlog |
|---|---|---|
| React | 18+ | Ecosystem, Claude Code podrška |
| Vite | Latest | Brz dev, jednostavan setup |
| TypeScript | 5+ | Type safety kritična za medicinsku aplikaciju |
| Tailwind CSS | 3+ | Brz development, konzistentan sistem |
| React Router | v6 | SPA routing |
| TanStack Query | v5 | Server state, caching, optimistic updates |
| Zustand | Latest | Minimalan client state (AI chat kontekst, session) |

### UI Komponente
- **Radix UI** (primitivi) + custom Tailwind stilovi — bez heavy component library-ja
- **Lucide React** za ikone
- **date-fns** za datum/vreme operacije (srpski locale)

---

## Backend / Database

| Tehnologija | Razlog |
|---|---|
| Supabase | Auth + Postgres + RLS + Edge Functions + Storage + Realtime |
| PostgreSQL 15+ | Preko Supabase (lokalni Docker za dev) |
| Supabase Auth | JWT, role-aware session |
| Row Level Security | Svaka tabela ima RLS, multi-tenant izolacija |
| Supabase Edge Functions | Deno runtime, Anthropic SDK, agent logika |
| Supabase Storage | Attachmenti, dokumenti, eksporti |

### Lokalni development
```bash
supabase init
supabase start  # pokreće lokalni Docker stack
# Studio dostupan na http://localhost:54323
```

---

## AI Arhitektura

### Model
- **claude-sonnet-4-5** za sve agente u MVP-u
- Prelaz na Opus za kompleksne zadatke (dijagnostičke predloge, analizu) posle MVP-a

### Agent Layer

```
Korisnik (chat/voice)
    ↓
Frontend Chat UI (React)
    ↓
Supabase Edge Function: /agent
    ↓
Anthropic API (claude-sonnet)
    + Tools definisane u Edge Function
    ↓
Supabase Database (RLS zaštita)
```

### Kako Tools funkcionišu

Agent dobija skup tools baziran na ulozi korisnika i trenutnom kontekstu:

```typescript
// Primer tool definicija koje agent može koristiti
const tools = [
  {
    name: "get_today_appointments",
    description: "Vraća listu termina za danas za aktuelnu kliniku",
    input_schema: { ... }
  },
  {
    name: "get_patient_context", 
    description: "Vraća kompletan kontekst pacijenta: anamneza, poslednje posete, plan lečenja",
    input_schema: { type: "object", properties: { patient_id: { type: "string" } } }
  },
  {
    name: "create_appointment",
    description: "Kreira novi termin",
    input_schema: { ... }
  },
  {
    name: "update_visit_notes",
    description: "Dodaje ili ažurira napomene posete",
    input_schema: { ... }
  },
  {
    name: "complete_visit",
    description: "Završava posetу i beleži urađene usluge",
    input_schema: { ... }
  }
  // itd.
]
```

### Agent Kontekst (System Prompt)

Svaki agent poziv nosi:
- Identitet korisnika (ime, uloga, klinika)
- Aktuelni screen/kontekst (koji pacijent, koji dan, šta je otvoreno)
- Kratka istorija razgovora (poslednje N poruka)
- Relevantni podaci iz baze (ne cela baza, samo ono što je potrebno)

### Voice Interface (Priprema za MVP)
- Web Speech API za browser-based voice input (besplatno, radi u Chrome/Edge)
- Tekst se šalje agentu kao normalna poruka
- Response se prikazuje tekstualno (TTS opciono posle MVP-a)
- Arhitektura je identična — samo input layer se menja

---

## Multi-Tenant Arhitektura

### Princip
Svaka tabela u bazi ima `clinic_id` kolonu.
RLS policy osigurava da korisnik vidi samo podatke svoje klinike.

### Tenant Identifikacija
- Korisnik se loguje → Supabase Auth JWT
- JWT sadrži `clinic_id` u `app_metadata`
- RLS koristi `auth.jwt() -> 'app_metadata' -> 'clinic_id'`
- Nema tenant switch bez ponovnog logina (MVP)

### Izolacija
```sql
-- Primer RLS politike
CREATE POLICY "clinic_isolation" ON patients
  USING (clinic_id = (auth.jwt() -> 'app_metadata' ->> 'clinic_id')::uuid);
```

---

## Folder Struktura (Frontend)

```
src/
  agent/              # AI agent utilities, hooks, types
    useAgent.ts       # Glavni hook za agent komunikaciju
    AgentChat.tsx     # Chat UI komponenta
    tools.ts          # Tool type definicije
  components/         # Shared UI komponente
    ui/               # Primitivi (Button, Input, Card, Badge...)
    layout/           # Shell, Sidebar, Header
  features/           # Feature moduli
    appointments/     # Planer i kalendar
    patients/         # Kartoni pacijenata
    visits/           # Visit workflow
    settings/         # Klinika, korisnici, usluge
  lib/                # Utilities
    supabase.ts       # Supabase client
    date.ts           # Date helpers (srpski locale)
  types/              # Globalni TypeScript types
  pages/              # Route komponente
```

## Folder Struktura (Supabase)

```
supabase/
  migrations/         # SQL migracije (numerisane)
  functions/          # Edge Functions
    agent/            # Glavni agent endpoint
    agent-patient/    # Patient-context agent (buduće)
  seed.sql            # Demo podaci za development
```

---

## Dizajn Principi UI

### Estetika
- **Medicinska preciznost + moderna toplina** — čisto, ali ne hladno
- Dominantno bela/svetlo siva pozadina
- Akcentna boja: duboka teal/slate-blue (#0F6B6B ili slično) — medicinska, pouzdana
- Tipografija: **DM Sans** (interfejs) + **DM Mono** (medicinske vrednosti, ID-ovi)
- Kompaktni layout — doktori gledaju u ekran kratko, informacija mora biti odmah vidljiva

### Agent Chat Panel
- Fiksiran sa desne strane (collapsible)
- Uvek dostupan, bez navigacije do posebne stranice
- Kontekstualno svestan — automatski zna šta je otvoreno

### Mobile / Tablet
- Primarno desktop (doktori koriste PC/tablet u ordinaciji)
- Tablet: layout se prilagođava (sidebar postaje bottom nav)
- Mobile: ograničena podrška u MVP-u, voice input prioritet
