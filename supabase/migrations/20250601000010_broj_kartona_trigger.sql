-- =============================================================================
-- DentApp Compliance — Auto-generisanje broja stomatološkog kartona
-- Sl. glasnik RS 45/2025, Član 3, tačka 2.2: "Broj stomatološkog kartona"
--
-- Format: [PREFIX]-[YYYY]-[NNNNN]
--   PREFIX  — kratka šifra klinike (iz clinics.settings->>'karton_prefix',
--              fallback: prva 3 slova naziva klinike, verzalima)
--   YYYY    — 4-cifrena godina
--   NNNNN   — redni broj, nula-padovan na 5 cifara, resetuje se svake godine,
--              scoped po klinici (svaka klinika ima sopstveni brojač)
--
-- Trigger se aktivira pri INSERT na patients ako je broj_kartona IS NULL.
-- Radi čak i za direktne DB inserte (importi, migracije) — nije app-level logika.
-- =============================================================================
-- DOWN:
--   DROP TRIGGER IF EXISTS patients_assign_broj_kartona ON patients;
--   DROP FUNCTION IF EXISTS generate_broj_kartona();
--   DROP TABLE IF EXISTS clinic_karton_sequences;
-- =============================================================================

-- =============================================================================
-- Sequence tabela — atomični brojač po klinici po godini
-- =============================================================================
CREATE TABLE IF NOT EXISTS clinic_karton_sequences (
  clinic_id     uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  year          int  NOT NULL,
  last_number   int  NOT NULL DEFAULT 0,
  PRIMARY KEY (clinic_id, year)
);

COMMENT ON TABLE clinic_karton_sequences IS
  'Interni brojač za auto-generisanje broja stomatološkog kartona po klinici po godini.';

-- =============================================================================
-- Funkcija — generisanje broja kartona
-- =============================================================================
CREATE OR REPLACE FUNCTION generate_broj_kartona()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_year        int;
  v_prefix      text;
  v_next_num    int;
BEGIN
  -- Samo ako broj_kartona nije već postavljen
  IF NEW.broj_kartona IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_year := EXTRACT(YEAR FROM now())::int;

  -- Uzmi prefix iz settings klinike, fallback na prva 3 slova naziva (verzali)
  SELECT COALESCE(
    NULLIF(TRIM(settings->>'karton_prefix'), ''),
    UPPER(LEFT(TRIM(name), 3))
  )
  INTO v_prefix
  FROM clinics
  WHERE id = NEW.clinic_id;

  -- Sanitizuj prefix: samo slova i cifre, max 5 znaka
  v_prefix := UPPER(REGEXP_REPLACE(COALESCE(v_prefix, 'KLN'), '[^A-Z0-9]', '', 'g'));
  v_prefix := LEFT(v_prefix, 5);
  IF v_prefix = '' THEN
    v_prefix := 'KLN';
  END IF;

  -- Atomični increment rednog broja (upsert)
  INSERT INTO clinic_karton_sequences (clinic_id, year, last_number)
  VALUES (NEW.clinic_id, v_year, 1)
  ON CONFLICT (clinic_id, year)
  DO UPDATE SET last_number = clinic_karton_sequences.last_number + 1
  RETURNING last_number INTO v_next_num;

  -- Sastavi broj kartona
  NEW.broj_kartona := v_prefix
    || '-' || v_year::text
    || '-' || LPAD(v_next_num::text, 5, '0');

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION generate_broj_kartona() IS
  'Trigger funkcija: auto-generisanje broja stomatološkog kartona pri INSERT pacijenta (Čl. 3, Pravilnik 45/2025)';

-- =============================================================================
-- Trigger
-- =============================================================================
DROP TRIGGER IF EXISTS patients_assign_broj_kartona ON patients;

CREATE TRIGGER patients_assign_broj_kartona
  BEFORE INSERT ON patients
  FOR EACH ROW
  EXECUTE FUNCTION generate_broj_kartona();

-- =============================================================================
-- Retroaktivno dodeljivanje brojeva postojećim pacijentima bez kartona
-- (Pokreni samo jednom, posle deployment-a migracije)
-- Svaki pacijent koji nema broj_kartona dobija privremeni poziv update-a
-- koji aktivira trigger.
-- =============================================================================
-- NAPOMENA: Ovaj blok se izvršava automatski pri db reset/migration up.
-- Siguran je jer trigger proverava NULL pre generisanja.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT id, clinic_id FROM patients
    WHERE broj_kartona IS NULL AND deleted_at IS NULL
    ORDER BY created_at ASC
  LOOP
    -- Privremeno setuj dummy vrednost pa null da bi trigger proradio
    -- kroz UPDATE (trigger je BEFORE INSERT, ne UPDATE, pa koristimo direktno)
    UPDATE patients
    SET broj_kartona = (
      SELECT
        COALESCE(
          NULLIF(TRIM(c.settings->>'karton_prefix'), ''),
          UPPER(LEFT(TRIM(c.name), 3))
        )
        || '-' || EXTRACT(YEAR FROM r2.created_at)::text
        || '-' || LPAD(
            (
              SELECT COALESCE(
                (SELECT last_number + 1 FROM clinic_karton_sequences
                 WHERE clinic_id = r.clinic_id
                   AND year = EXTRACT(YEAR FROM r2.created_at)::int),
                1
              )
            )::text,
            5, '0'
          )
      FROM clinics c, patients r2
      WHERE c.id = r.clinic_id AND r2.id = r.id
    )
    WHERE id = r.id AND broj_kartona IS NULL;

    -- Sinhronizuj sequence za ovu kliniku/godinu
    INSERT INTO clinic_karton_sequences (clinic_id, year, last_number)
    SELECT
      r.clinic_id,
      EXTRACT(YEAR FROM created_at)::int,
      1
    FROM patients WHERE id = r.id
    ON CONFLICT (clinic_id, year)
    DO UPDATE SET last_number = clinic_karton_sequences.last_number + 1;
  END LOOP;
END;
$$;

GRANT SELECT, INSERT, UPDATE ON clinic_karton_sequences TO authenticated;
