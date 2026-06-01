-- Dozvoli brisanje draft poseta (slucajno kreiranje, greska korisnika)
-- Samo posete sa status='draft' mogu biti obrisane
CREATE POLICY "visits_delete" ON visits
  FOR DELETE TO authenticated
  USING (clinic_id = auth_clinic_id() AND status = 'draft');
