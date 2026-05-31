-- =============================================================================
-- DentApp — Inicijalni schema
-- =============================================================================

-- Ekstenzije
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- Trigger funkcija za auto-update updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- CLINICS
-- =============================================================================
CREATE TABLE clinics (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  address         text,
  city            text,
  country         text DEFAULT 'RS',
  phone           text,
  email           text,
  tax_id          text,
  settings        jsonb DEFAULT '{}',
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE TRIGGER clinics_updated_at
  BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- PROFILES (extends auth.users)
-- =============================================================================
CREATE TABLE profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id       uuid NOT NULL REFERENCES clinics(id),
  first_name      text NOT NULL,
  last_name       text NOT NULL,
  display_name    text,
  role            text NOT NULL CHECK (role IN ('owner','doctor','specialist','assistant','reception','inventory')),
  is_doctor       boolean DEFAULT false,
  specialty       text,
  phone           text,
  color           text,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX ON profiles(clinic_id);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- PATIENTS
-- =============================================================================
CREATE TABLE patients (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       uuid NOT NULL REFERENCES clinics(id),
  first_name      text NOT NULL,
  last_name       text NOT NULL,
  date_of_birth   date,
  gender          text CHECK (gender IN ('M','F','other')),
  phone           text,
  phone_alt       text,
  email           text,
  address         text,
  city            text,
  jmbg            text,
  notes           text,
  is_active       boolean DEFAULT true,
  created_by      uuid REFERENCES profiles(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  deleted_at      timestamptz
);

CREATE INDEX ON patients(clinic_id);
CREATE INDEX ON patients(clinic_id, last_name, first_name);

CREATE TRIGGER patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- PATIENT MEDICAL RECORDS
-- =============================================================================
CREATE TABLE patient_medical_records (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id           uuid NOT NULL REFERENCES clinics(id),
  patient_id          uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  general_anamnesis   text,
  allergies           text[],
  medications         text[],
  systemic_diseases   text[],
  medical_alerts      text,
  dental_anamnesis    text,
  extra_data          jsonb DEFAULT '{}',
  updated_by          uuid REFERENCES profiles(id),
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),
  UNIQUE(patient_id)
);

CREATE INDEX ON patient_medical_records(clinic_id);

CREATE TRIGGER patient_medical_records_updated_at
  BEFORE UPDATE ON patient_medical_records
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- ODONTOGRAM TEETH
-- =============================================================================
CREATE TABLE odontogram_teeth (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       uuid NOT NULL REFERENCES clinics(id),
  patient_id      uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  tooth_fdi       text NOT NULL,
  status          text DEFAULT 'healthy' CHECK (status IN (
    'healthy','decayed','filled','crowned','missing','implant',
    'bridge','root_canal','to_extract','extracted','other'
  )),
  surfaces        jsonb DEFAULT '{}',
  treatment_note  text,
  updated_by      uuid REFERENCES profiles(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(patient_id, tooth_fdi)
);

CREATE INDEX ON odontogram_teeth(clinic_id, patient_id);

CREATE TRIGGER odontogram_teeth_updated_at
  BEFORE UPDATE ON odontogram_teeth
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- SERVICES (cenovnik)
-- =============================================================================
CREATE TABLE services (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       uuid NOT NULL REFERENCES clinics(id),
  name            text NOT NULL,
  name_en         text,
  category        text CHECK (category IN ('dijagnostika','terapija','hirurgija','ortodoncija','protetika','prevencija','estetika')),
  default_price   numeric(10,2),
  duration_min    int,
  is_active       boolean DEFAULT true,
  sort_order      int DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX ON services(clinic_id, category);

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- APPOINTMENTS
-- =============================================================================
CREATE TABLE appointments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id           uuid NOT NULL REFERENCES clinics(id),
  patient_id          uuid NOT NULL REFERENCES patients(id),
  doctor_id           uuid NOT NULL REFERENCES profiles(id),
  starts_at           timestamptz NOT NULL,
  ends_at             timestamptz NOT NULL,
  duration_min        int GENERATED ALWAYS AS
                        (CAST(EXTRACT(EPOCH FROM (ends_at - starts_at)) / 60 AS int)) STORED,
  appointment_type    text DEFAULT 'regular' CHECK (appointment_type IN ('regular','urgent','followup','consultation','specialist')),
  title               text,
  notes               text,
  status              text DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','no_show')),
  arrival_status      text DEFAULT 'not_arrived' CHECK (arrival_status IN ('not_arrived','arrived','in_chair','completed')),
  treatment_plan_id   uuid,
  created_by          uuid REFERENCES profiles(id),
  cancelled_by        uuid REFERENCES profiles(id),
  cancellation_reason text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX ON appointments(clinic_id, starts_at);
CREATE INDEX ON appointments(clinic_id, doctor_id, starts_at);
CREATE INDEX ON appointments(patient_id);

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- VISITS
-- =============================================================================
CREATE TABLE visits (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id           uuid NOT NULL REFERENCES clinics(id),
  patient_id          uuid NOT NULL REFERENCES patients(id),
  doctor_id           uuid NOT NULL REFERENCES profiles(id),
  appointment_id      uuid REFERENCES appointments(id),
  visit_date          date NOT NULL,
  started_at          timestamptz,
  ended_at            timestamptz,
  chief_complaint     text,
  clinical_notes      text,
  diagnosis           text,
  status              text DEFAULT 'draft' CHECK (status IN ('draft','completed')),
  completed_at        timestamptz,
  completed_by        uuid REFERENCES profiles(id),
  created_by          uuid REFERENCES profiles(id),
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX ON visits(clinic_id, visit_date DESC);
CREATE INDEX ON visits(patient_id, visit_date DESC);

CREATE TRIGGER visits_updated_at
  BEFORE UPDATE ON visits
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- VISIT PROCEDURES
-- =============================================================================
CREATE TABLE visit_procedures (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id           uuid NOT NULL REFERENCES clinics(id),
  visit_id            uuid NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  patient_id          uuid NOT NULL REFERENCES patients(id),
  doctor_id           uuid NOT NULL REFERENCES profiles(id),
  service_id          uuid REFERENCES services(id),
  tooth_fdi           text,
  description         text,
  price               numeric(10,2),
  created_by          uuid REFERENCES profiles(id),
  created_at          timestamptz DEFAULT now()
);

CREATE INDEX ON visit_procedures(visit_id);

-- =============================================================================
-- TREATMENT PLANS
-- =============================================================================
CREATE TABLE treatment_plans (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id           uuid NOT NULL REFERENCES clinics(id),
  patient_id          uuid NOT NULL REFERENCES patients(id),
  doctor_id           uuid NOT NULL REFERENCES profiles(id),
  title               text NOT NULL DEFAULT 'Plan lečenja',
  description         text,
  status              text DEFAULT 'draft' CHECK (status IN ('draft','proposed','accepted','in_progress','completed','archived')),
  estimated_total     numeric(10,2),
  created_by          uuid REFERENCES profiles(id),
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX ON treatment_plans(clinic_id, patient_id);

CREATE TRIGGER treatment_plans_updated_at
  BEFORE UPDATE ON treatment_plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- TREATMENT PLAN ITEMS
-- =============================================================================
CREATE TABLE treatment_plan_items (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id           uuid NOT NULL REFERENCES clinics(id),
  treatment_plan_id   uuid NOT NULL REFERENCES treatment_plans(id) ON DELETE CASCADE,
  service_id          uuid REFERENCES services(id),
  tooth_fdi           text,
  description         text NOT NULL,
  estimated_price     numeric(10,2),
  status              text DEFAULT 'planned' CHECK (status IN ('planned','in_progress','completed','skipped')),
  priority            int DEFAULT 0,
  sort_order          int DEFAULT 0,
  notes               text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX ON treatment_plan_items(treatment_plan_id);

CREATE TRIGGER treatment_plan_items_updated_at
  BEFORE UPDATE ON treatment_plan_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- AGENT CONVERSATIONS
-- =============================================================================
CREATE TABLE agent_conversations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id           uuid NOT NULL REFERENCES clinics(id),
  user_id             uuid NOT NULL REFERENCES profiles(id),
  context_type        text CHECK (context_type IN ('patient','appointment','visit','general')),
  context_id          uuid,
  messages            jsonb DEFAULT '[]',
  started_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX ON agent_conversations(clinic_id, user_id, context_type, context_id);

CREATE TRIGGER agent_conversations_updated_at
  BEFORE UPDATE ON agent_conversations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- AUDIT LOG
-- =============================================================================
CREATE TABLE audit_log (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id           uuid NOT NULL REFERENCES clinics(id),
  user_id             uuid REFERENCES profiles(id),
  action              text NOT NULL,
  entity_type         text NOT NULL,
  entity_id           uuid,
  old_data            jsonb,
  new_data            jsonb,
  ip_address          text,
  created_at          timestamptz DEFAULT now()
);

CREATE INDEX ON audit_log(clinic_id, entity_type, entity_id);
CREATE INDEX ON audit_log(clinic_id, created_at DESC);

-- =============================================================================
-- GRANTS — eksplicitno jer auto_expose_new_tables = false od 2026-05-30
-- =============================================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Service role već ima sve permisije
