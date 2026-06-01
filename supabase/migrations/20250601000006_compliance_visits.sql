-- =============================================================================
-- DentApp Compliance — Posete: polja zahtevana Pravilnikom o e-kartonu
-- Sl. glasnik RS 45/2025, Član 4 (Osnovni zdravstveni podaci, tačke 10, 18, 19)
-- =============================================================================
-- DOWN:
--   ALTER TABLE visits DROP COLUMN IF EXISTS dijagnoza_mkb;
--   ALTER TABLE visits DROP COLUMN IF EXISTS usluga_na_terenu;
--   ALTER TABLE visits DROP COLUMN IF EXISTS usluga_invalidnom_licu;
-- =============================================================================

-- MKB-10 šifra dijagnoze (strukturovano, odvojeno od slobodnog teksta)
-- Član 4, tačka 1.10: "Dijagnoza/Dijagnoze"
-- Napomena: visits.diagnosis ostaje kao dijagnoza_opis (slobodan tekst).
-- dijagnoza_mkb je šifra iz Međunarodne klasifikacije bolesti (MKB-10).
-- Primer: 'K02.1' (Karijes dentina), 'K05.1' (Hronični gingivitis)
ALTER TABLE visits
  ADD COLUMN IF NOT EXISTS dijagnoza_mkb varchar(10);

COMMENT ON COLUMN visits.dijagnoza_mkb IS
  'MKB-10 šifra dijagnoze (npr. K02.1). Odvojeno od slobodnog teksta u koloni diagnosis (Čl. 4, Pravilnik 45/2025)';

COMMENT ON COLUMN visits.diagnosis IS
  'Slobodan opis dijagnoze (dijagnoza_opis). Videti i dijagnoza_mkb za strukturovanu šifru.';

-- Usluga pružena na terenu (van ordinacije)
-- Član 4, tačka 1.18: "Usluga na terenu"
ALTER TABLE visits
  ADD COLUMN IF NOT EXISTS usluga_na_terenu boolean DEFAULT false NOT NULL;

COMMENT ON COLUMN visits.usluga_na_terenu IS
  'Zdravstvena usluga pružena na terenu (van ordinacije) (Čl. 4, Pravilnik 45/2025)';

-- Usluga pružena licu sa invaliditetom
-- Član 4, tačka 1.19: "Usluga pružena invalidnom licu"
ALTER TABLE visits
  ADD COLUMN IF NOT EXISTS usluga_invalidnom_licu boolean DEFAULT false NOT NULL;

COMMENT ON COLUMN visits.usluga_invalidnom_licu IS
  'Zdravstvena usluga pružena licu sa invaliditetom (Čl. 4, Pravilnik 45/2025)';

-- Index za pretragu po MKB šifri (korisno za buduće RIZIS exportove i analitiku)
CREATE INDEX IF NOT EXISTS visits_dijagnoza_mkb_idx
  ON visits(clinic_id, dijagnoza_mkb)
  WHERE dijagnoza_mkb IS NOT NULL;
