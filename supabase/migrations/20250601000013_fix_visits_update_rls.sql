-- =============================================================================
-- Fix: visits_update RLS politika — dodaje WITH CHECK klauzulu
--
-- Problem: bez eksplicitne WITH CHECK, PostgreSQL podrazumeva da nova vrednost
-- reda mora zadovoljiti isti uslov kao USING (status = 'draft'). Kada se
-- status menja iz 'draft' u 'completed', WITH CHECK puca jer novi red nema
-- status = 'draft'. Ovo tiho blokira završavanje posete.
--
-- Rešenje: USING ostaje (samo draft posete mogu biti uređivane), ali
-- WITH CHECK dozvoljava bilo koji status dokle god clinic_id ostaje isti.
-- Logika "completed poseta je read-only" se čuva na USING nivou — ne možeš
-- odabrati completed posetу za UPDATE (USING blokira), ali možeš promeniti
-- draft posetу u completed (WITH CHECK to dozvoljava).
-- =============================================================================
-- DOWN:
--   DROP POLICY IF EXISTS "visits_update" ON visits;
--   CREATE POLICY "visits_update" ON visits
--     FOR UPDATE TO authenticated
--     USING (clinic_id = auth_clinic_id() AND status = 'draft');
-- =============================================================================

DROP POLICY IF EXISTS "visits_update" ON visits;

CREATE POLICY "visits_update" ON visits
  FOR UPDATE TO authenticated
  USING (clinic_id = auth_clinic_id() AND status = 'draft')
  WITH CHECK (clinic_id = auth_clinic_id());
