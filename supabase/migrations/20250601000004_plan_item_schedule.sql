-- Dodaje opciono planiranje datuma i veze sa terminom na stavkama plana lečenja.
-- Osnova za buduće auto-zakazivanje (Faza 2) i linkovanje plan_item ↔ appointment.
ALTER TABLE treatment_plan_items
  ADD COLUMN IF NOT EXISTS planned_date date,
  ADD COLUMN IF NOT EXISTS appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL;

COMMENT ON COLUMN treatment_plan_items.planned_date IS 'Opcioni planirani datum za ovu stavku lečenja';
COMMENT ON COLUMN treatment_plan_items.appointment_id IS 'Termin na kome je ova stavka zakazana/urađena';
