-- =============================================================================
-- DentApp Compliance — Profili/Doktori: polja zahtevana Pravilnikom o e-kartonu
-- Sl. glasnik RS 45/2025, Član 4 (Registar resursa, tačke 4-14)
-- i Član 15 (podaci o zdravstvenim radnicima u RIZIS-u)
-- =============================================================================
-- DOWN:
--   ALTER TABLE profiles DROP COLUMN IF EXISTS jmbg;
--   ALTER TABLE profiles DROP COLUMN IF EXISTS broj_licence;
--   ALTER TABLE profiles DROP COLUMN IF EXISTS datum_licence;
--   ALTER TABLE profiles DROP COLUMN IF EXISTS datum_vazenja_licence;
--   ALTER TABLE profiles DROP COLUMN IF EXISTS status_licence;
--   ALTER TABLE profiles DROP COLUMN IF EXISTS uza_specijalizacija;
--   DROP INDEX IF EXISTS profiles_clinic_jmbg_unique;
-- =============================================================================

-- JMBG zdravstvenog radnika — identifikacija doktora u RIZIS-u
-- Član 4, Registar resursa, tačka 4: "JMBG/EBS zdravstvenog radnika"
-- Član 15: "JMBG/EBS, ime i prezime, broj licence, status i datum važenja licence,
--           specijalizacija..."
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS jmbg char(13);

COMMENT ON COLUMN profiles.jmbg IS
  'JMBG zdravstvenog radnika — obavezan za RIZIS identifikaciju (Čl. 4, Čl. 15, Pravilnik 45/2025)';

-- Broj licence Komore stomatologa Srbije
-- Član 4, Registar resursa, tačka 9: "Broj licence"
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS broj_licence varchar(30);

COMMENT ON COLUMN profiles.broj_licence IS
  'Broj licence Komore stomatologa Srbije (Čl. 4 Registar resursa, Pravilnik 45/2025)';

-- Datum sticanja ili poslednjeg obnavljanja licence
-- Član 4, Registar resursa, tačka 10: "Datum sticanja/obnavljanja licence"
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS datum_licence date;

COMMENT ON COLUMN profiles.datum_licence IS
  'Datum sticanja ili obnavljanja licence (Čl. 4 Registar resursa, Pravilnik 45/2025)';

-- Datum važenja licence
-- Član 4, Registar resursa, tačka 12: "Datum važenja licence"
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS datum_vazenja_licence date;

COMMENT ON COLUMN profiles.datum_vazenja_licence IS
  'Datum isteka važenja licence (Čl. 4 Registar resursa, Pravilnik 45/2025)';

-- Status licence (aktivan/neaktivan/suspendovan)
-- Član 4, Registar resursa, tačka 11: "Status licence"
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS status_licence varchar(30);

COMMENT ON COLUMN profiles.status_licence IS
  'Status licence: aktivna/neaktivna/suspendovana (Čl. 4 Registar resursa, Pravilnik 45/2025)';

-- Uža specijalizacija
-- Član 4, Registar resursa, tačka 14: "Uža specijalizacija"
-- Napomena: profiles.specialty = specijalizacija (opšta)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS uza_specijalizacija varchar(100);

COMMENT ON COLUMN profiles.uza_specijalizacija IS
  'Uža specijalizacija (npr. ortodoncija, oralna hirurgija). Videti i specialty za opštu specijalizaciju. (Čl. 4, Pravilnik 45/2025)';

-- JMBG doktora mora biti jedinstven (globalno, JMBG je jedinstven za svaku osobu)
-- Filterujemo NULL kako bi se dozvolilo da doktori bez JMBG-a ne blokiraju jedni druge
CREATE UNIQUE INDEX IF NOT EXISTS profiles_jmbg_unique
  ON profiles(jmbg)
  WHERE jmbg IS NOT NULL;

-- Index za pretragu po broju licence
CREATE INDEX IF NOT EXISTS profiles_broj_licence_idx
  ON profiles(clinic_id, broj_licence)
  WHERE broj_licence IS NOT NULL;
