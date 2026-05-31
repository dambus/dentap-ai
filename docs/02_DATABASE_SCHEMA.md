# DentApp — Database Schema v1

## Principi

- Svaka tabela ima `clinic_id` (multi-tenant)
- `id` je uvek `uuid` sa `gen_random_uuid()` defaultom
- `created_at` i `updated_at` na svim tabelama
- `created_by` (user_id) na svim tabelama gde je relevantno
- RLS na svakoj tabeli od prvog dana
- Soft delete (`deleted_at`) umesto hard delete tamo gde je potrebna istorija
- Audit log tabela za kritične akcije

---

## Tabele

### clinics
```sql
CREATE TABLE clinics (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  address         text,
  city            text,
  country         text DEFAULT 'RS',
  phone           text,
  email           text,
  tax_id          text,           -- PIB
  settings        jsonb DEFAULT '{}',  -- konfigurabine opcije
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
```

### profiles
```sql
-- Extends auth.users, jedan red po Supabase korisniku
CREATE TABLE profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id),
  clinic_id       uuid NOT NULL REFERENCES clinics(id),
  first_name      text NOT NULL,
  last_name       text NOT NULL,
  display_name    text,           -- kako se prikazuje u UI (npr. "Dr. Marković")
  role            text NOT NULL,  -- 'owner','doctor','specialist','assistant','reception','inventory'
  is_doctor       boolean DEFAULT false,
  specialty       text,           -- 'opšta stomatologija', 'ortodoncija', itd.
  phone           text,
  color           text,           -- hex boja za prikaz u kalendaru
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
```

### patients
```sql
CREATE TABLE patients (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       uuid NOT NULL REFERENCES clinics(id),
  first_name      text NOT NULL,
  last_name       text NOT NULL,
  date_of_birth   date,
  gender          text,           -- 'M','F','other'
  phone           text,
  phone_alt       text,
  email           text,
  address         text,
  city            text,
  jmbg            text,           -- opcionalno, osetljivo
  notes           text,           -- opšte napomene (vidljive recepciji)
  is_active       boolean DEFAULT true,
  created_by      uuid REFERENCES profiles(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  deleted_at      timestamptz     -- soft delete
);

CREATE INDEX ON patients(clinic_id);
CREATE INDEX ON patients(clinic_id, last_name, first_name);
```

### patient_medical_records
```sql
-- Jedan red po pacijentu, ažurira se tokom vremena
CREATE TABLE patient_medical_records (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id           uuid NOT NULL REFERENCES clinics(id),
  patient_id          uuid NOT NULL REFERENCES patients(id),
  -- Anamneza
  general_anamnesis   text,
  allergies           text[],
  medications         text[],
  systemic_diseases   text[],
  -- Upozorenja
  medical_alerts      text,       -- crvena upozorenja (npr. "alerija na penicilin!")
  -- Stomatološka anamneza
  dental_anamnesis    text,
  -- Slobodni podaci
  extra_data          jsonb DEFAULT '{}',
  updated_by          uuid REFERENCES profiles(id),
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),
  UNIQUE(patient_id)
);
```

### odontogram_teeth
```sql
-- Status svakog zuba po FDI nomenklaturi
CREATE TABLE odontogram_teeth (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       uuid NOT NULL REFERENCES clinics(id),
  patient_id      uuid NOT NULL REFERENCES patients(id),
  tooth_fdi       text NOT NULL,  -- npr. '11','21','36' po FDI
  -- Statusi
  status          text DEFAULT 'healthy',
  -- 'healthy','decayed','filled','crowned','missing','implant',
  -- 'bridge','root_canal','to_extract','extracted','other'
  surfaces        jsonb DEFAULT '{}',  -- status po površinama (M,D,O,V,L)
  -- Linkovi
  treatment_note  text,
  -- Audit
  updated_by      uuid REFERENCES profiles(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(patient_id, tooth_fdi)
);
```

### services (cenovnik)
```sql
CREATE TABLE services (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       uuid NOT NULL REFERENCES clinics(id),
  name            text NOT NULL,
  name_en         text,
  category        text,           -- 'dijagnostika','terapija','hirurgija','ortodoncija'...
  default_price   numeric(10,2),
  duration_min    int,            -- trajanje u minutima
  is_active       boolean DEFAULT true,
  sort_order      int DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
```

### appointments
```sql
CREATE TABLE appointments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id           uuid NOT NULL REFERENCES clinics(id),
  patient_id          uuid NOT NULL REFERENCES patients(id),
  doctor_id           uuid NOT NULL REFERENCES profiles(id),
  -- Vreme
  starts_at           timestamptz NOT NULL,
  ends_at             timestamptz NOT NULL,
  duration_min        int GENERATED ALWAYS AS 
                        (EXTRACT(EPOCH FROM (ends_at - starts_at))/60)::int STORED,
  -- Tip i sadržaj
  appointment_type    text DEFAULT 'regular',
  -- 'regular','urgent','followup','consultation','specialist'
  title               text,       -- kratak opis (auto-generiše se ako je prazan)
  notes               text,
  -- Životni ciklus
  status              text DEFAULT 'scheduled',
  -- 'scheduled','completed','cancelled','no_show'
  -- Operativno stanje (dan posete)
  arrival_status      text DEFAULT 'not_arrived',
  -- 'not_arrived','arrived','in_chair','completed'
  -- Linkovi
  treatment_plan_id   uuid,       -- opcionalno
  -- Meta
  created_by          uuid REFERENCES profiles(id),
  cancelled_by        uuid REFERENCES profiles(id),
  cancellation_reason text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX ON appointments(clinic_id, starts_at);
CREATE INDEX ON appointments(clinic_id, doctor_id, starts_at);
CREATE INDEX ON appointments(patient_id);
```

### visits
```sql
-- Svaka realizovana poseta (completed appointment → visit)
CREATE TABLE visits (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id           uuid NOT NULL REFERENCES clinics(id),
  patient_id          uuid NOT NULL REFERENCES patients(id),
  doctor_id           uuid NOT NULL REFERENCES profiles(id),
  appointment_id      uuid REFERENCES appointments(id),
  -- Vreme
  visit_date          date NOT NULL,
  started_at          timestamptz,
  ended_at            timestamptz,
  -- Klinički sadržaj
  chief_complaint     text,       -- razlog dolaska
  clinical_notes      text,       -- napomene doktora
  diagnosis           text,
  -- Stanje
  status              text DEFAULT 'draft',
  -- 'draft','completed'
  completed_at        timestamptz,
  completed_by        uuid REFERENCES profiles(id),
  -- Meta
  created_by          uuid REFERENCES profiles(id),
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);
```

### visit_procedures
```sql
-- Šta je urađeno tokom posete
CREATE TABLE visit_procedures (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id           uuid NOT NULL REFERENCES clinics(id),
  visit_id            uuid NOT NULL REFERENCES visits(id),
  patient_id          uuid NOT NULL REFERENCES patients(id),
  doctor_id           uuid NOT NULL REFERENCES profiles(id),
  service_id          uuid REFERENCES services(id),
  tooth_fdi           text,       -- na kom zubu (ako je relevantno)
  description         text,       -- slobodan opis ako nema service
  price               numeric(10,2),
  -- Meta
  created_by          uuid REFERENCES profiles(id),
  created_at          timestamptz DEFAULT now()
);
```

### treatment_plans
```sql
CREATE TABLE treatment_plans (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id           uuid NOT NULL REFERENCES clinics(id),
  patient_id          uuid NOT NULL REFERENCES patients(id),
  doctor_id           uuid NOT NULL REFERENCES profiles(id),
  title               text NOT NULL DEFAULT 'Plan lečenja',
  description         text,
  status              text DEFAULT 'draft',
  -- 'draft','proposed','accepted','in_progress','completed','archived'
  estimated_total     numeric(10,2),
  created_by          uuid REFERENCES profiles(id),
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);
```

### treatment_plan_items
```sql
CREATE TABLE treatment_plan_items (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id           uuid NOT NULL REFERENCES clinics(id),
  treatment_plan_id   uuid NOT NULL REFERENCES treatment_plans(id),
  service_id          uuid REFERENCES services(id),
  tooth_fdi           text,
  description         text NOT NULL,
  estimated_price     numeric(10,2),
  status              text DEFAULT 'planned',
  -- 'planned','in_progress','completed','skipped'
  priority            int DEFAULT 0,
  sort_order          int DEFAULT 0,
  notes               text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);
```

### agent_conversations
```sql
-- Istorija razgovora sa AI agentom po korisniku/sesiji
CREATE TABLE agent_conversations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id           uuid NOT NULL REFERENCES clinics(id),
  user_id             uuid NOT NULL REFERENCES profiles(id),
  -- Kontekst koji je bio aktivan
  context_type        text,       -- 'patient','appointment','visit','general'
  context_id          uuid,       -- id pacijenta, termina, posete itd.
  -- Poruke (niz {role, content})
  messages            jsonb DEFAULT '[]',
  -- Meta
  started_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX ON agent_conversations(clinic_id, user_id, context_type, context_id);
```

### audit_log
```sql
CREATE TABLE audit_log (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id           uuid NOT NULL REFERENCES clinics(id),
  user_id             uuid REFERENCES profiles(id),
  action              text NOT NULL,  -- 'patient.created','visit.completed'...
  entity_type         text NOT NULL,
  entity_id           uuid,
  old_data            jsonb,
  new_data            jsonb,
  ip_address          text,
  created_at          timestamptz DEFAULT now()
);

CREATE INDEX ON audit_log(clinic_id, entity_type, entity_id);
CREATE INDEX ON audit_log(clinic_id, created_at DESC);
```

---

## RLS Politike (Pattern)

```sql
-- Svaka tabela dobija ovu politiku (prilagođenu)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinic_isolation_select" ON patients
  FOR SELECT
  USING (
    clinic_id = (auth.jwt() -> 'app_metadata' ->> 'clinic_id')::uuid
  );

CREATE POLICY "clinic_isolation_insert" ON patients
  FOR INSERT
  WITH CHECK (
    clinic_id = (auth.jwt() -> 'app_metadata' ->> 'clinic_id')::uuid
  );

-- Update i Delete slično
```

---

## Seed Data (Demo Klinika)

```sql
-- Demo klinika
INSERT INTO clinics (id, name, city) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Demo Ordinacija', 'Beograd');

-- Demo doktori, pacijenti i termini generišu se kroz seed.sql
```

---

## Migracije

Svaka migracija je u `supabase/migrations/` sa formatom:
```
YYYYMMDDHHMMSS_kratki_opis.sql
```

Primer:
```
20250101000000_initial_schema.sql
20250102000000_rls_policies.sql
20250103000000_seed_demo_data.sql
```
