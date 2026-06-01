-- =============================================================================
-- DentApp Compliance — Pacijenti: polja zahtevana Pravilnikom o e-kartonu
-- Sl. glasnik RS 45/2025, Član 3 (identifikacioni podaci) i Član 7
-- =============================================================================
-- DOWN:
--   ALTER TABLE patients DROP COLUMN IF EXISTS ebs;
--   ALTER TABLE patients DROP COLUMN IF EXISTS lbo;
--   ALTER TABLE patients DROP COLUMN IF EXISTS broj_kartona;
--   ALTER TABLE patients DROP COLUMN IF EXISTS donor_card;
--   DROP INDEX IF EXISTS patients_clinic_jmbg_unique;
--   DROP INDEX IF EXISTS patients_clinic_ebs_unique;
--   DROP INDEX IF EXISTS patients_clinic_broj_kartona_unique;
-- =============================================================================

-- Evidencijski broj stranca (EBS) — za strane državljane bez JMBG
-- Član 3, tačka 1.1: "JMBG / Evidencijski broj stranca (EBS)"
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS ebs varchar(30);

COMMENT ON COLUMN patients.ebs IS
  'Evidencijski broj stranca — za strane državljane bez JMBG (Čl. 3, Pravilnik 45/2025)';

-- Lični broj osiguranika — broj zdravstvenog osiguranja
-- Član 3, tačka 1.2: "Lični broj osiguranika"
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS lbo varchar(30);

COMMENT ON COLUMN patients.lbo IS
  'Lični broj osiguranika (zdravstveno osiguranje) (Čl. 3, Pravilnik 45/2025)';

-- Broj stomatološkog kartona — auto-generiše se triggerom u migraciji 010
-- Član 3, tačka 2.2: "Broj stomatološkog kartona"
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS broj_kartona text;

COMMENT ON COLUMN patients.broj_kartona IS
  'Jedinstveni broj stomatološkog kartona, format [PREFIX]-[YYYY]-[NNNNN], auto-generisan (Čl. 3, Pravilnik 45/2025)';

-- Donorska kartica
-- Član 3, tačka 4: "Podatak o donorskoj kartici"
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS donor_card boolean DEFAULT false NOT NULL;

COMMENT ON COLUMN patients.donor_card IS
  'Pacijent poseduje donorsku karticu (Čl. 3, Pravilnik 45/2025)';

-- =============================================================================
-- Unique constraints
-- JMBG mora biti jedinstven unutar klinike (isti pacijent ne sme biti duplo).
-- Globalno, isti JMBG može biti u više klinika (multi-tenant).
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS patients_clinic_jmbg_unique
  ON patients(clinic_id, jmbg)
  WHERE jmbg IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS patients_clinic_ebs_unique
  ON patients(clinic_id, ebs)
  WHERE ebs IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS patients_clinic_broj_kartona_unique
  ON patients(clinic_id, broj_kartona)
  WHERE broj_kartona IS NOT NULL;

-- Index za pretragu po broju kartona
CREATE INDEX IF NOT EXISTS patients_broj_kartona_idx
  ON patients(broj_kartona)
  WHERE broj_kartona IS NOT NULL;
