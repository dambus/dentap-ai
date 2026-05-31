# DentApp — Quick Start za Developera

## Novi Repo Setup (5 minuta)

### 1. Kreiraj repo i kopiraj docs
```bash
mkdir dentapp
cd dentapp
git init
mkdir docs
# Kopiraj sve fajlove iz ovog paketa u docs/
```

### 2. Daj Claude Code-u kontekst
U VS Code sa Claude Code ekstenzijom, na početku sesije kaži:

```
Pročitaj sve fajlove iz docs/ foldera. 
Tu je kompletna dokumentacija projekta DentApp.
Počinjemo sa Task 001 iz docs/04_MVP_TASKS.md
```

### 3. Reži Supabase lokalno
```bash
# Instaliraj Supabase CLI ako nemaš
brew install supabase/tap/supabase  # macOS
# ili
npm install -g supabase              # cross-platform

# Inicijalizuj (u root-u projekta)
supabase init

# Pokreni (zahteva Docker Desktop)
supabase start
```

### 4. .env.local template
```bash
# Supabase (lokalni)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<iz supabase status output-a>
SUPABASE_SERVICE_ROLE_KEY=<iz supabase status output-a>

# Anthropic (za Edge Functions)
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Redosled Dokumenata

| Dokument | Kada pročitati |
|---|---|
| `CLAUDE.md` | Uvek — to su pravila za Claude Code |
| `00_PROJECT_BRIEF.md` | Na početku projekta |
| `01_TECH_STACK.md` | Pre setup-a i arhitekturalnih odluka |
| `02_DATABASE_SCHEMA.md` | Pre Task 003 i svake migracije |
| `03_AI_AGENT_ARCHITECTURE.md` | Pre Task 017-020 |
| `04_MVP_TASKS.md` | Svaki task posebno |

---

## Tipičan Razgovor sa Claude Code

**Za novi task:**
```
Krećemo sa Task 005 iz docs/04_MVP_TASKS.md.
Prethodni taskovi su završeni. Supabase lokalni server radi.
```

**Za debugging:**
```
Edge function agent vraća 403. 
Supabase lokalni, JWT je validan. 
Pogledaj RLS politike za tabelu appointments.
```

**Za pregled pre commita:**
```
Pregledaj Task 005 prihvatanje kriterijume i verifikuj da sve radi.
```

---

## Arhitektura u Jednoj Slici

```
┌──────────────────────────────────────────────────────────┐
│                    Browser (React + Vite)                  │
│                                                            │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │  Sidebar  │  │  Main Screen │  │    Agent Panel     │  │
│  │  (nav)    │  │  (content)   │  │    (chat UI)       │  │
│  └──────────┘  └──────────────┘  └────────────────────┘  │
└─────────────────────────────┬────────────────────────────┘
                              │ HTTP / WebSocket
┌─────────────────────────────▼────────────────────────────┐
│                   Supabase (lokalni Docker)                │
│                                                            │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │   Auth   │  │  PostgreSQL  │  │  Edge Functions    │  │
│  │  (JWT)   │  │  + RLS       │  │  /agent            │  │
│  └──────────┘  └──────────────┘  └────────┬───────────┘  │
└────────────────────────────────────────────┼──────────────┘
                                             │ HTTPS
                                    ┌────────▼────────┐
                                    │  Anthropic API   │
                                    │  claude-sonnet   │
                                    └─────────────────┘
```

---

## Šta Nije U Ovom Paketu

Finansijski modul, provizije doktora, inventar, pacijentski portal i sve što je označeno kao "dolazi posle MVP-a" namerno nisu uključeni. Dokumentovaće se kada MVP bude validan.

---

## Kontakt i Feedback Loop

Posle svakog završenog taska, napravi kratku listu:
- Šta je implementirano
- Šta je ostalo otvoreno ili nije idealno
- Sledeći task koji treba pokrenuti

To pomaže da se dokumentacija i task lista ažuriraju pre sledećeg koraka.
