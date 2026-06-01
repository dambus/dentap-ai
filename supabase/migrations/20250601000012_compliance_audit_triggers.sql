-- =============================================================================
-- DentApp Compliance — Audit log trigeri za osetljiva polja
-- Sl. glasnik RS 45/2025, Član 13 (zaštita integriteta podataka),
-- Član 14, tačka 4 (neporicanje odgovornosti)
--
-- Pokriva:
--   patients.jmbg, patients.ebs, patients.broj_kartona
--   visits.dijagnoza_mkb
--   patient_allergies (INSERT / UPDATE / DELETE)
--
-- Koristi postojeću audit_log tabelu (isti pattern, bez drugog mehanizma).
-- Trigger funkcija je SECURITY DEFINER da bi mogla pisati u audit_log
-- čak i kada korisnik nema direktni INSERT na audit_log.
-- =============================================================================
-- DOWN:
--   DROP TRIGGER IF EXISTS audit_patients_sensitive_fields ON patients;
--   DROP TRIGGER IF EXISTS audit_visits_mkb ON visits;
--   DROP TRIGGER IF EXISTS audit_patient_allergies ON patient_allergies;
--   DROP FUNCTION IF EXISTS audit_patients_sensitive();
--   DROP FUNCTION IF EXISTS audit_visits_mkb();
--   DROP FUNCTION IF EXISTS audit_patient_allergies_changes();
-- =============================================================================

-- =============================================================================
-- PATIENTS — audit kada se menjaju osetljiva identifikaciona polja
-- =============================================================================
CREATE OR REPLACE FUNCTION audit_patients_sensitive()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_changed boolean := false;
  v_old_data jsonb;
  v_new_data jsonb;
BEGIN
  -- Detektuj promene osetljivih polja
  IF TG_OP = 'INSERT' THEN
    v_changed := (NEW.jmbg IS NOT NULL OR NEW.ebs IS NOT NULL OR NEW.broj_kartona IS NOT NULL);
    v_old_data := NULL;
    v_new_data := jsonb_build_object(
      'jmbg', NEW.jmbg,
      'ebs', NEW.ebs,
      'broj_kartona', NEW.broj_kartona
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_changed := (
      (OLD.jmbg IS DISTINCT FROM NEW.jmbg) OR
      (OLD.ebs IS DISTINCT FROM NEW.ebs) OR
      (OLD.broj_kartona IS DISTINCT FROM NEW.broj_kartona)
    );
    v_old_data := jsonb_build_object(
      'jmbg', OLD.jmbg,
      'ebs', OLD.ebs,
      'broj_kartona', OLD.broj_kartona
    );
    v_new_data := jsonb_build_object(
      'jmbg', NEW.jmbg,
      'ebs', NEW.ebs,
      'broj_kartona', NEW.broj_kartona
    );
  END IF;

  IF v_changed THEN
    INSERT INTO audit_log (
      clinic_id, user_id, action, entity_type, entity_id,
      old_data, new_data
    ) VALUES (
      NEW.clinic_id,
      auth.uid(),
      'patient.' || LOWER(TG_OP) || '.sensitive_fields',
      'patients',
      NEW.id,
      v_old_data,
      v_new_data
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_patients_sensitive_fields ON patients;

CREATE TRIGGER audit_patients_sensitive_fields
  AFTER INSERT OR UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION audit_patients_sensitive();

-- =============================================================================
-- VISITS — audit kada se menja MKB dijagnoza
-- =============================================================================
CREATE OR REPLACE FUNCTION audit_visits_mkb()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (OLD.dijagnoza_mkb IS DISTINCT FROM NEW.dijagnoza_mkb) THEN
    INSERT INTO audit_log (
      clinic_id, user_id, action, entity_type, entity_id,
      old_data, new_data
    ) VALUES (
      NEW.clinic_id,
      auth.uid(),
      'visit.dijagnoza_mkb.updated',
      'visits',
      NEW.id,
      jsonb_build_object('dijagnoza_mkb', OLD.dijagnoza_mkb),
      jsonb_build_object('dijagnoza_mkb', NEW.dijagnoza_mkb)
    );
  ELSIF TG_OP = 'INSERT' AND NEW.dijagnoza_mkb IS NOT NULL THEN
    INSERT INTO audit_log (
      clinic_id, user_id, action, entity_type, entity_id,
      old_data, new_data
    ) VALUES (
      NEW.clinic_id,
      auth.uid(),
      'visit.dijagnoza_mkb.set',
      'visits',
      NEW.id,
      NULL,
      jsonb_build_object('dijagnoza_mkb', NEW.dijagnoza_mkb)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_visits_mkb ON visits;

CREATE TRIGGER audit_visits_mkb
  AFTER INSERT OR UPDATE ON visits
  FOR EACH ROW
  EXECUTE FUNCTION audit_visits_mkb();

-- =============================================================================
-- PATIENT ALLERGIES — audit svih promena (INSERT, UPDATE, DELETE)
-- Alergije su medicinski kritični podaci — svaka promena mora biti zabeležena
-- =============================================================================
CREATE OR REPLACE FUNCTION audit_patient_allergies_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action    text;
  v_entity_id uuid;
  v_old_data  jsonb;
  v_new_data  jsonb;
  v_clinic_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action     := 'patient_allergy.created';
    v_entity_id  := NEW.id;
    v_clinic_id  := NEW.clinic_id;
    v_old_data   := NULL;
    v_new_data   := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action     := 'patient_allergy.updated';
    v_entity_id  := NEW.id;
    v_clinic_id  := NEW.clinic_id;
    v_old_data   := to_jsonb(OLD);
    v_new_data   := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    v_action     := 'patient_allergy.deleted';
    v_entity_id  := OLD.id;
    v_clinic_id  := OLD.clinic_id;
    v_old_data   := to_jsonb(OLD);
    v_new_data   := NULL;
  END IF;

  INSERT INTO audit_log (
    clinic_id, user_id, action, entity_type, entity_id,
    old_data, new_data
  ) VALUES (
    v_clinic_id,
    auth.uid(),
    v_action,
    'patient_allergies',
    v_entity_id,
    v_old_data,
    v_new_data
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_patient_allergies ON patient_allergies;

CREATE TRIGGER audit_patient_allergies
  AFTER INSERT OR UPDATE OR DELETE ON patient_allergies
  FOR EACH ROW
  EXECUTE FUNCTION audit_patient_allergies_changes();
