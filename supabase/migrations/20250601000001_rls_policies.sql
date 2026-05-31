-- =============================================================================
-- DentApp — Row Level Security politike
-- Princip: svaki korisnik vidi samo podatke svoje klinike.
-- clinic_id se čita iz JWT app_metadata (postavlja se pri seedovanju/registraciji).
-- =============================================================================

-- Helper funkcija — čita clinic_id iz JWT
CREATE OR REPLACE FUNCTION auth_clinic_id() RETURNS uuid AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'clinic_id')::uuid;
$$ LANGUAGE sql STABLE;

-- Helper funkcija — čita ulogu iz JWT
CREATE OR REPLACE FUNCTION auth_role() RETURNS text AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role')::text;
$$ LANGUAGE sql STABLE;

-- =============================================================================
-- CLINICS
-- =============================================================================
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinics_select" ON clinics
  FOR SELECT TO authenticated
  USING (id = auth_clinic_id());

CREATE POLICY "clinics_update" ON clinics
  FOR UPDATE TO authenticated
  USING (id = auth_clinic_id() AND auth_role() = 'owner');

-- =============================================================================
-- PROFILES
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (clinic_id = auth_clinic_id() AND auth_role() = 'owner');

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE TO authenticated
  USING (
    clinic_id = auth_clinic_id()
    AND (id = auth.uid() OR auth_role() = 'owner')
  );

-- =============================================================================
-- PATIENTS
-- =============================================================================
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients_select" ON patients
  FOR SELECT TO authenticated
  USING (clinic_id = auth_clinic_id() AND deleted_at IS NULL);

CREATE POLICY "patients_insert" ON patients
  FOR INSERT TO authenticated
  WITH CHECK (clinic_id = auth_clinic_id());

CREATE POLICY "patients_update" ON patients
  FOR UPDATE TO authenticated
  USING (clinic_id = auth_clinic_id());

-- Soft delete — recepcija i doktori mogu da "obrišu" (postave deleted_at)
CREATE POLICY "patients_delete" ON patients
  FOR DELETE TO authenticated
  USING (clinic_id = auth_clinic_id() AND auth_role() IN ('owner','doctor','reception'));

-- =============================================================================
-- PATIENT MEDICAL RECORDS
-- =============================================================================
ALTER TABLE patient_medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pmr_select" ON patient_medical_records
  FOR SELECT TO authenticated
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "pmr_insert" ON patient_medical_records
  FOR INSERT TO authenticated
  WITH CHECK (clinic_id = auth_clinic_id());

CREATE POLICY "pmr_update" ON patient_medical_records
  FOR UPDATE TO authenticated
  USING (clinic_id = auth_clinic_id());

-- =============================================================================
-- ODONTOGRAM TEETH
-- =============================================================================
ALTER TABLE odontogram_teeth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "odontogram_select" ON odontogram_teeth
  FOR SELECT TO authenticated
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "odontogram_insert" ON odontogram_teeth
  FOR INSERT TO authenticated
  WITH CHECK (clinic_id = auth_clinic_id());

CREATE POLICY "odontogram_update" ON odontogram_teeth
  FOR UPDATE TO authenticated
  USING (clinic_id = auth_clinic_id());

-- =============================================================================
-- SERVICES
-- =============================================================================
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_select" ON services
  FOR SELECT TO authenticated
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "services_insert" ON services
  FOR INSERT TO authenticated
  WITH CHECK (clinic_id = auth_clinic_id() AND auth_role() IN ('owner','reception'));

CREATE POLICY "services_update" ON services
  FOR UPDATE TO authenticated
  USING (clinic_id = auth_clinic_id() AND auth_role() IN ('owner','reception'));

-- =============================================================================
-- APPOINTMENTS
-- =============================================================================
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_select" ON appointments
  FOR SELECT TO authenticated
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "appointments_insert" ON appointments
  FOR INSERT TO authenticated
  WITH CHECK (clinic_id = auth_clinic_id());

CREATE POLICY "appointments_update" ON appointments
  FOR UPDATE TO authenticated
  USING (clinic_id = auth_clinic_id());

-- =============================================================================
-- VISITS
-- =============================================================================
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "visits_select" ON visits
  FOR SELECT TO authenticated
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "visits_insert" ON visits
  FOR INSERT TO authenticated
  WITH CHECK (clinic_id = auth_clinic_id());

CREATE POLICY "visits_update" ON visits
  FOR UPDATE TO authenticated
  USING (clinic_id = auth_clinic_id() AND status = 'draft');

-- =============================================================================
-- VISIT PROCEDURES
-- =============================================================================
ALTER TABLE visit_procedures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "visit_procedures_select" ON visit_procedures
  FOR SELECT TO authenticated
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "visit_procedures_insert" ON visit_procedures
  FOR INSERT TO authenticated
  WITH CHECK (clinic_id = auth_clinic_id());

CREATE POLICY "visit_procedures_delete" ON visit_procedures
  FOR DELETE TO authenticated
  USING (clinic_id = auth_clinic_id());

-- =============================================================================
-- TREATMENT PLANS
-- =============================================================================
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "treatment_plans_select" ON treatment_plans
  FOR SELECT TO authenticated
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "treatment_plans_insert" ON treatment_plans
  FOR INSERT TO authenticated
  WITH CHECK (clinic_id = auth_clinic_id());

CREATE POLICY "treatment_plans_update" ON treatment_plans
  FOR UPDATE TO authenticated
  USING (clinic_id = auth_clinic_id());

-- =============================================================================
-- TREATMENT PLAN ITEMS
-- =============================================================================
ALTER TABLE treatment_plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tpi_select" ON treatment_plan_items
  FOR SELECT TO authenticated
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "tpi_insert" ON treatment_plan_items
  FOR INSERT TO authenticated
  WITH CHECK (clinic_id = auth_clinic_id());

CREATE POLICY "tpi_update" ON treatment_plan_items
  FOR UPDATE TO authenticated
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "tpi_delete" ON treatment_plan_items
  FOR DELETE TO authenticated
  USING (clinic_id = auth_clinic_id());

-- =============================================================================
-- AGENT CONVERSATIONS
-- =============================================================================
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_conv_select" ON agent_conversations
  FOR SELECT TO authenticated
  USING (clinic_id = auth_clinic_id() AND user_id = auth.uid());

CREATE POLICY "agent_conv_insert" ON agent_conversations
  FOR INSERT TO authenticated
  WITH CHECK (clinic_id = auth_clinic_id() AND user_id = auth.uid());

CREATE POLICY "agent_conv_update" ON agent_conversations
  FOR UPDATE TO authenticated
  USING (clinic_id = auth_clinic_id() AND user_id = auth.uid());

-- =============================================================================
-- AUDIT LOG (samo čitanje, piše samo service role)
-- =============================================================================
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select" ON audit_log
  FOR SELECT TO authenticated
  USING (clinic_id = auth_clinic_id() AND auth_role() = 'owner');

-- Service role (Edge Functions) piše audit log bez RLS restrikcija
