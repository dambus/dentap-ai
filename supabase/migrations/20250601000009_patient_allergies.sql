-- =============================================================================
-- DentApp Compliance — Strukturovane alergije (nova tabela)
-- Sl. glasnik RS 45/2025, Član 4 (Alergijska reakcija, tačke 1-10)
--
-- Prethodno: patient_medical_records.allergies text[] (slobodan tekst)
-- Posle: patient_allergies tabela sa svim obaveznim poljima pravilnika
-- Stari text[] ostaje — ne briše se (backward compatibility). Novi unosi
-- idu u patient_allergies. Migracija prenosi postojeće string vrednosti.
-- =============================================================================
-- DOWN:
--   DROP TABLE IF EXISTS patient_allergies;
--   -- (patient_medical_records.allergies ostaje nepromenjen)
-- =============================================================================

CREATE TABLE IF NOT EXISTS patient_allergies (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id                   uuid NOT NULL REFERENCES clinics(id),
  patient_id                  uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Ko je uneo zapis
  recorded_by                 uuid REFERENCES profiles(id),

  -- Agens i lek (Član 4, Alergijska reakcija, tačke 4-6)
  agens                       text,
  -- Slobodan opis agensa koji izaziva alergijsku reakciju

  atc_sifra_leka              varchar(15),
  -- ATC (Anatomsko-terapijsko-hemijska) šifra leka, npr. 'J01CA04'

  naziv_leka_inn              varchar(255),
  -- INN (International Nonproprietary Name) naziv leka, npr. 'amoksicilin'

  -- Reakcija (Član 4, Alergijska reakcija, tačke 7-9)
  oblik_reakcije              text,
  -- Oblik alergijske reakcije, npr. 'urtikarija', 'anafilaksa', 'angioedema'

  alergen                     text,
  -- Agens koji izaziva reakciju (može se razlikovati od leka, npr. lateks, hrana)

  vrsta_alergijske_reakcije   text,
  -- Vrsta, npr. 'IgE-posredovana', 'citotoksična', 'pseudoalergija', 'nepoznato'

  -- Datum (Član 4, Alergijska reakcija, tačka 10)
  datum_alergijske_reakcije   date,

  -- Administrativno
  is_active                   boolean NOT NULL DEFAULT true,
  notes                       text,
  -- Slobodna napomena (nije zahtevano pravilnikom, ali korisno klinički)

  -- Izvor zapisa (za traceability pri migraciji)
  migrated_from_text          text,
  -- Originalni slobodni tekst iz patient_medical_records.allergies (ako je migriran)

  created_at                  timestamptz DEFAULT now(),
  updated_at                  timestamptz DEFAULT now()
);

COMMENT ON TABLE patient_allergies IS
  'Strukturovani zapisi o alergijama pacijenata, obavezni po Čl. 4 Pravilnika o e-kartonu (Sl. glasnik RS 45/2025)';

COMMENT ON COLUMN patient_allergies.agens IS
  'Slobodan opis agensa (Čl. 4, Alergijska reakcija, tačka 4)';
COMMENT ON COLUMN patient_allergies.atc_sifra_leka IS
  'ATC šifra leka (Čl. 4, Alergijska reakcija, tačka 5)';
COMMENT ON COLUMN patient_allergies.naziv_leka_inn IS
  'INN naziv leka (Čl. 4, Alergijska reakcija, tačka 6)';
COMMENT ON COLUMN patient_allergies.oblik_reakcije IS
  'Oblik alergijske reakcije (Čl. 4, Alergijska reakcija, tačka 7)';
COMMENT ON COLUMN patient_allergies.alergen IS
  'Alergen koji izaziva reakciju (Čl. 4, Alergijska reakcija, tačka 8)';
COMMENT ON COLUMN patient_allergies.vrsta_alergijske_reakcije IS
  'Vrsta alergijske reakcije (Čl. 4, Alergijska reakcija, tačka 9)';
COMMENT ON COLUMN patient_allergies.datum_alergijske_reakcije IS
  'Datum alergijske reakcije (Čl. 4, Alergijska reakcija, tačka 10)';

CREATE INDEX IF NOT EXISTS patient_allergies_patient_idx
  ON patient_allergies(clinic_id, patient_id);

CREATE INDEX IF NOT EXISTS patient_allergies_active_idx
  ON patient_allergies(patient_id, is_active);

CREATE TRIGGER patient_allergies_updated_at
  BEFORE UPDATE ON patient_allergies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- Migracija postojećih podataka iz text[] u strukturovanu tabelu
-- Svaki string iz allergies[] postaje zaseban red sa agens = string vrednost.
-- migrated_from_text čuva originalni tekst za traceability.
-- =============================================================================
INSERT INTO patient_allergies (
  clinic_id,
  patient_id,
  agens,
  migrated_from_text,
  notes
)
SELECT
  pmr.clinic_id,
  pmr.patient_id,
  TRIM(allergy_text),
  TRIM(allergy_text),
  'Automatski migrirano iz slobodnog teksta. Dopuniti ATC šifru i vrstu reakcije.'
FROM patient_medical_records pmr,
     UNNEST(pmr.allergies) AS allergy_text
WHERE pmr.allergies IS NOT NULL
  AND array_length(pmr.allergies, 1) > 0
  AND TRIM(allergy_text) <> '';

-- Napomena: patient_medical_records.allergies text[] se NE briše.
-- Ostaje za backward compatibility tokom tranzicije (UI može čitati iz obe lokacije).
-- Preporučeno je da novi unosi idu isključivo u patient_allergies.

GRANT SELECT, INSERT, UPDATE, DELETE ON patient_allergies TO authenticated;
