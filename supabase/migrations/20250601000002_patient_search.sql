-- =============================================================================
-- DentApp — Normalizacija pretrage za srpske dijakritike
-- ć/Ć→c, č/Č→c, ž/Ž→z, š/Š→s, đ/Đ→dj
-- Mora biti identično funkciji normalizeSr() u src/lib/normalizeSr.ts
-- =============================================================================

CREATE OR REPLACE FUNCTION normalize_sr(input text)
RETURNS text
IMMUTABLE STRICT
LANGUAGE sql AS $$
  SELECT lower(
    replace(replace(
    replace(replace(
    replace(replace(
    replace(replace(
    replace(replace(
      input,
    'Š', 'S'), 'š', 's'),
    'Č', 'C'), 'č', 'c'),
    'Ć', 'C'), 'ć', 'c'),
    'Ž', 'Z'), 'ž', 'z'),
    'Đ', 'DJ'), 'đ', 'dj')
  );
$$;

-- search_text = "ime prezime prezime ime" (oba redosled) radi bolji match
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS search_text text
  GENERATED ALWAYS AS (
    normalize_sr(
      first_name || ' ' || last_name || ' ' || last_name || ' ' || first_name
    )
  ) STORED;

-- Indeks za brzu pretragu po klinici
CREATE INDEX IF NOT EXISTS patients_search_text_idx
  ON patients (clinic_id, search_text);
