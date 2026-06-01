-- =============================================================================
-- DentApp Compliance — Klinika: polja zahtevana Pravilnikom o e-kartonu
-- Sl. glasnik RS 45/2025, Član 4 (Osnovni zdravstveni podaci, tačke 1-4)
-- =============================================================================
-- DOWN:
--   ALTER TABLE clinics DROP COLUMN IF EXISTS maticni_broj;
--   ALTER TABLE clinics DROP COLUMN IF EXISTS organizaciona_jedinica;
--   -- karton_prefix se uklanja iz settings jsonb (ne može se rollback-ovati automatski)
-- =============================================================================

-- Matični broj pravnog lica — jedinstven registarski broj iz APR-a
-- Razlika od tax_id (PIB): PIB je poreski broj, matični broj je registarski
-- Član 4, Osnovni zdravstveni podaci, tačka 1: "Matični broj pravnog lica"
ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS maticni_broj varchar(20);

COMMENT ON COLUMN clinics.maticni_broj IS
  'Matični broj pravnog lica iz Agencije za privredne registre (APR). Razlikuje se od tax_id (PIB). (Čl. 4, Pravilnik 45/2025)';

COMMENT ON COLUMN clinics.tax_id IS
  'PIB (Poreski identifikacioni broj). Videti i maticni_broj za registarski broj APR-a.';

-- Organizaciona jedinica (ambulanta, odeljenje)
-- Član 4, Osnovni zdravstveni podaci, tačka 2: "Organizaciona jedinica"
ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS organizaciona_jedinica varchar(200);

COMMENT ON COLUMN clinics.organizaciona_jedinica IS
  'Naziv organizacione jedinice u okviru pravnog lica (Čl. 4, Pravilnik 45/2025)';

-- karton_prefix se čuva u clinics.settings jsonb pod ključem 'karton_prefix'
-- Primer: settings = { "karton_prefix": "DEM" }
-- Koristi se za auto-generisanje broja stomatološkog kartona (migracija 010).
-- Nije nova kolona — koristimo postojeći settings jsonb.
COMMENT ON COLUMN clinics.settings IS
  'Konfiguracione opcije klinike (jsonb). Uključuje: karton_prefix (string, 2-5 slova, za broj kartona).';
