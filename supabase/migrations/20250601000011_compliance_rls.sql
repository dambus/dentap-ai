-- =============================================================================
-- DentApp Compliance — RLS politike za nove tabele i sequence tabelu
-- Konzistentno sa postojećim RLS paternom (klinička izolacija)
-- =============================================================================
-- DOWN:
--   DROP POLICY IF EXISTS "patient_allergies_select" ON patient_allergies;
--   DROP POLICY IF EXISTS "patient_allergies_insert" ON patient_allergies;
--   DROP POLICY IF EXISTS "patient_allergies_update" ON patient_allergies;
--   DROP POLICY IF EXISTS "patient_allergies_delete" ON patient_allergies;
--   ALTER TABLE patient_allergies DISABLE ROW LEVEL SECURITY;
--   DROP POLICY IF EXISTS "sequences_select" ON clinic_karton_sequences;
--   DROP POLICY IF EXISTS "sequences_insert" ON clinic_karton_sequences;
--   DROP POLICY IF EXISTS "sequences_update" ON clinic_karton_sequences;
--   ALTER TABLE clinic_karton_sequences DISABLE ROW LEVEL SECURITY;
-- =============================================================================

-- =============================================================================
-- PATIENT ALLERGIES
-- Alergije su deo medicinskog kartona — isti nivo pristupa kao patient_medical_records
-- =============================================================================
ALTER TABLE patient_allergies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patient_allergies_select" ON patient_allergies
  FOR SELECT TO authenticated
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "patient_allergies_insert" ON patient_allergies
  FOR INSERT TO authenticated
  WITH CHECK (clinic_id = auth_clinic_id());

CREATE POLICY "patient_allergies_update" ON patient_allergies
  FOR UPDATE TO authenticated
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "patient_allergies_delete" ON patient_allergies
  FOR DELETE TO authenticated
  USING (clinic_id = auth_clinic_id());

-- =============================================================================
-- CLINIC KARTON SEQUENCES
-- Interni brojač — authenticated korisnici klinike mogu čitati i ažurirati
-- (trigger funkcija koristi SECURITY DEFINER, ali direktan pristup mora biti zaštićen)
-- =============================================================================
ALTER TABLE clinic_karton_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sequences_select" ON clinic_karton_sequences
  FOR SELECT TO authenticated
  USING (clinic_id = auth_clinic_id());

-- INSERT i UPDATE se dešavaju kroz trigger (SECURITY DEFINER funkciju).
-- Direktni INSERT/UPDATE od strane korisnika nije potreban u normalnom workflow-u,
-- ali dozvoljava se owner-u radi korekcija (npr. resetovanje brojača).
CREATE POLICY "sequences_insert" ON clinic_karton_sequences
  FOR INSERT TO authenticated
  WITH CHECK (clinic_id = auth_clinic_id() AND auth_role() = 'owner');

CREATE POLICY "sequences_update" ON clinic_karton_sequences
  FOR UPDATE TO authenticated
  USING (clinic_id = auth_clinic_id() AND auth_role() = 'owner');
