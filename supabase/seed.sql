-- =============================================================================
-- DentApp — Demo Seed Podaci
-- Pokretanje: supabase db reset
-- NIKADA ne koristiti prave pacijentske podatke!
-- =============================================================================

-- =============================================================================
-- KLINIKA
-- =============================================================================
INSERT INTO public.clinics (id, name, address, city, phone, email) VALUES
  ('00000000-0000-0000-0000-000000000001',
   'Demo Stomatološka Ordinacija',
   'Knez Mihailova 14',
   'Beograd',
   '+381 11 123 4567',
   'kontakt@demo.dentapp.rs');

-- =============================================================================
-- AUTH KORISNICI
-- Lozinka za sve: demo1234
-- raw_app_meta_data nosi clinic_id i role koji se koriste u RLS i agent promptu
-- =============================================================================
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  role, aud,
  confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, reauthentication_token,
  created_at, updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000000',
    'ana@demo.dentapp.rs',
    crypt('demo1234', gen_salt('bf')),
    now(),
    jsonb_build_object('clinic_id', '00000000-0000-0000-0000-000000000001', 'role', 'owner'),
    jsonb_build_object('full_name', 'Dr. Ana Petrović'),
    'authenticated', 'authenticated',
    '', '', '', '', '',
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000000',
    'marko@demo.dentapp.rs',
    crypt('demo1234', gen_salt('bf')),
    now(),
    jsonb_build_object('clinic_id', '00000000-0000-0000-0000-000000000001', 'role', 'doctor'),
    jsonb_build_object('full_name', 'Dr. Marko Jovanović'),
    'authenticated', 'authenticated',
    '', '', '', '', '',
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000013',
    '00000000-0000-0000-0000-000000000000',
    'jelena@demo.dentapp.rs',
    crypt('demo1234', gen_salt('bf')),
    now(),
    jsonb_build_object('clinic_id', '00000000-0000-0000-0000-000000000001', 'role', 'reception'),
    jsonb_build_object('full_name', 'Jelena Nikolić'),
    'authenticated', 'authenticated',
    '', '', '', '', '',
    now(), now()
  );

-- GoTrue zahteva prazne stringove za sve token polja (ne NULL)
UPDATE auth.users SET
  confirmation_token    = COALESCE(confirmation_token, ''),
  recovery_token        = COALESCE(recovery_token, ''),
  email_change_token_new     = COALESCE(email_change_token_new, ''),
  email_change               = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change          = COALESCE(phone_change, ''),
  phone_change_token    = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id IN (
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000013'
);

-- Auth identities (potrebno za email login)
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000011', 'ana@demo.dentapp.rs',
   '{"sub":"00000000-0000-0000-0000-000000000011","email":"ana@demo.dentapp.rs","email_verified":true}'::jsonb,
   'email', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000012', 'marko@demo.dentapp.rs',
   '{"sub":"00000000-0000-0000-0000-000000000012","email":"marko@demo.dentapp.rs","email_verified":true}'::jsonb,
   'email', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000013', 'jelena@demo.dentapp.rs',
   '{"sub":"00000000-0000-0000-0000-000000000013","email":"jelena@demo.dentapp.rs","email_verified":true}'::jsonb,
   'email', now(), now(), now());

-- =============================================================================
-- PROFILI
-- =============================================================================
INSERT INTO public.profiles (id, clinic_id, first_name, last_name, display_name, role, is_doctor, specialty, color) VALUES
  ('00000000-0000-0000-0000-000000000011',
   '00000000-0000-0000-0000-000000000001',
   'Ana', 'Petrović', 'Dr. Ana Petrović',
   'owner', true, 'Opšta stomatologija', '#0B6E6E'),
  ('00000000-0000-0000-0000-000000000012',
   '00000000-0000-0000-0000-000000000001',
   'Marko', 'Jovanović', 'Dr. Marko Jovanović',
   'doctor', true, 'Oralna hirurgija', '#3B82F6'),
  ('00000000-0000-0000-0000-000000000013',
   '00000000-0000-0000-0000-000000000001',
   'Jelena', 'Nikolić', 'Jelena Nikolić',
   'reception', false, null, null);

-- =============================================================================
-- CENOVNIK USLUGA
-- =============================================================================
INSERT INTO public.services (id, clinic_id, name, name_en, category, default_price, duration_min, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001',
   'Stomatološki pregled', 'Dental examination', 'dijagnostika', 600.00, 30, 1),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001',
   'Parodontalni pregled', 'Periodontal examination', 'dijagnostika', 1000.00, 30, 2),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001',
   'Rendgen snimak (1 zub)', 'X-ray (1 tooth)', 'dijagnostika', 800.00, 15, 3),
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000001',
   'Ortopan snimak', 'Panoramic X-ray', 'dijagnostika', 2500.00, 15, 4),
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000001',
   'Kompomerni ispun (1 površina)', 'Composite filling (1 surface)', 'terapija', 3500.00, 60, 10),
  ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000001',
   'Kompomerni ispun (2 površine)', 'Composite filling (2 surfaces)', 'terapija', 5000.00, 75, 11),
  ('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000001',
   'Devitalizacija zuba', 'Root canal treatment', 'terapija', 3000.00, 60, 12),
  ('00000000-0000-0000-0000-000000000208', '00000000-0000-0000-0000-000000000001',
   'Endodontsko lečenje (1 kanal)', 'Endodontic treatment (1 canal)', 'terapija', 8000.00, 90, 13),
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000001',
   'Ekstrakcija zuba', 'Tooth extraction', 'hirurgija', 2000.00, 30, 20),
  ('00000000-0000-0000-0000-000000000210', '00000000-0000-0000-0000-000000000001',
   'Hirurška ekstrakcija', 'Surgical extraction', 'hirurgija', 5000.00, 60, 21),
  ('00000000-0000-0000-0000-000000000211', '00000000-0000-0000-0000-000000000001',
   'Krunica metal-keramika', 'PFM crown', 'protetika', 35000.00, 90, 30),
  ('00000000-0000-0000-0000-000000000212', '00000000-0000-0000-0000-000000000001',
   'Krunica cirkonijum', 'Zirconia crown', 'protetika', 55000.00, 90, 31),
  ('00000000-0000-0000-0000-000000000213', '00000000-0000-0000-0000-000000000001',
   'Uklanjanje kamenca (ultrazvuk)', 'Scaling (ultrasonic)', 'prevencija', 2500.00, 45, 40),
  ('00000000-0000-0000-0000-000000000214', '00000000-0000-0000-0000-000000000001',
   'Fluoridacija', 'Fluoride treatment', 'prevencija', 800.00, 20, 41),
  ('00000000-0000-0000-0000-000000000215', '00000000-0000-0000-0000-000000000001',
   'Izbeljivanje zuba (ordinacija)', 'In-office whitening', 'estetika', 12000.00, 90, 50);

-- =============================================================================
-- PACIJENTI (10 demo pacijenata, bez JMBG-a)
-- =============================================================================
INSERT INTO public.patients (id, clinic_id, first_name, last_name, date_of_birth, gender, phone, email, city, notes, created_by) VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001',
   'Stefan', 'Marković', '1989-03-15', 'M', '+381 64 123 4567', 'stefan.m@email.rs',
   'Beograd', null, '00000000-0000-0000-0000-000000000013'),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001',
   'Milica', 'Jovanović', '1996-07-22', 'F', '+381 63 234 5678', null,
   'Beograd', null, '00000000-0000-0000-0000-000000000013'),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001',
   'Petar', 'Nikolić', '1979-11-08', 'M', '+381 69 345 6789', 'petar.n@gmail.com',
   'Beograd', 'Pacijent ima dijabetes — upozoriti doktora pre zahvata', '00000000-0000-0000-0000-000000000013'),
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001',
   'Jovana', 'Stojanović', '1972-04-30', 'F', '+381 60 456 7890', null,
   'Novi Sad', 'Antikoagulantna terapija! Obavezno pitati kardiologа pre hirurgije.', '00000000-0000-0000-0000-000000000013'),
  ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000001',
   'Aleksandar', 'Đorđević', '1993-09-18', 'M', '+381 64 567 8901', null,
   'Beograd', null, '00000000-0000-0000-0000-000000000013'),
  ('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000001',
   'Ana', 'Pavlović', '2005-01-25', 'F', '+381 63 678 9012', null,
   'Beograd', null, '00000000-0000-0000-0000-000000000013'),
  ('00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000001',
   'Bojan', 'Ilić', '1986-06-12', 'M', '+381 69 789 0123', 'bojan.i@work.rs',
   'Zemun', null, '00000000-0000-0000-0000-000000000013'),
  ('00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000001',
   'Dragana', 'Lazić', '1982-12-03', 'F', '+381 60 890 1234', null,
   'Beograd', null, '00000000-0000-0000-0000-000000000013'),
  ('00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000001',
   'Nikola', 'Kostić', '2000-08-14', 'M', '+381 64 901 2345', 'nikola.k@email.rs',
   'Beograd', null, '00000000-0000-0000-0000-000000000013'),
  ('00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000001',
   'Snežana', 'Tomić', '1964-02-19', 'F', '+381 63 012 3456', null,
   'Beograd', 'Pacijentkinja ima protezu gornje vilice.', '00000000-0000-0000-0000-000000000013');

-- =============================================================================
-- MEDICINSKA DOKUMENTACIJA
-- =============================================================================
INSERT INTO public.patient_medical_records
  (clinic_id, patient_id, general_anamnesis, allergies, medications, systemic_diseases, medical_alerts, dental_anamnesis, updated_by)
VALUES
  -- Stefan — alergija na penicilin
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101',
   'Pacijent generalno zdrav. Ne puši, umereno konzumira alkohol.',
   ARRAY['penicilin', 'amoksicilin'], ARRAY[]::text[], ARRAY[]::text[],
   'ALERGIJA NA PENICILIN I AMOKSICILIN! Koristiti alternativne antibiotike.',
   'Redovno dolazi na kontrole. Strah od bušenja — potreban oprez.',
   '00000000-0000-0000-0000-000000000011'),

  -- Milica — bez posebnih napomena
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000102',
   'Zdrava pacijentkinja. Ne puši.',
   ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
   null, 'Prva poseta u ordinaciji.',
   '00000000-0000-0000-0000-000000000011'),

  -- Petar — dijabetes
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000103',
   'Pacijent ima dijabetes melitus tip 2 pod kontrolom. Redovno kontroliše šećer.',
   ARRAY[]::text[], ARRAY['Metformin 500mg', 'Gliclazid 30mg'], ARRAY['Dijabetes melitus tip 2'],
   'Dijabetes tip 2 — proveriti glikemiju pre zahvata. Produženo zarastanje rana.',
   'Pacijent ima problem sa parodontom — redovne kontrole na 3 meseca.',
   '00000000-0000-0000-0000-000000000011'),

  -- Jovana — srčana bolest + antikoagulanti
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000104',
   'Koronarna bolest srca. Ugradnja stenta 2019. godine. Pod kardiolološkim praćenjem.',
   ARRAY[]::text[], ARRAY['Aspirin 100mg', 'Xarelto 20mg', 'Bisoprolol 5mg'],
   ARRAY['Koronarna bolest srca', 'Arterijska hipertenzija'],
   'ANTIKOAGULANTNA TERAPIJA (Xarelto)! Pre hirurških zahvata obavezna konsultacija sa kardiologom i eventualna prilagodba terapije.',
   'Poslednja poseta bila pre 8 meseci. Potrebna kontrola.',
   '00000000-0000-0000-0000-000000000011'),

  -- Snežana — proteza
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000110',
   'Pacijentkinja u dobrom opštem stanju. Hipertenzija pod kontrolom.',
   ARRAY[]::text[], ARRAY['Enalapril 10mg'], ARRAY['Arterijska hipertenzija'],
   null, 'Nosi mobilnu protezu gornje vilice (rađena 2020). Žali se na loše prijanjanje.',
   '00000000-0000-0000-0000-000000000011');

-- =============================================================================
-- ODONTOGRAM — demo status zuba za Stefana Markovića
-- =============================================================================
INSERT INTO public.odontogram_teeth (clinic_id, patient_id, tooth_fdi, status, treatment_note, updated_by) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101',
   '36', 'decayed', 'Karijes u predelu okluzalne površine. Planiran ispun.', '00000000-0000-0000-0000-000000000011'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101',
   '11', 'filled', 'Kompomerni ispun rađen 2023.', '00000000-0000-0000-0000-000000000011'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101',
   '46', 'root_canal', 'Endodontsko lečenje završeno. Krunica u planu.', '00000000-0000-0000-0000-000000000011'),
  -- Jovana Stojanović
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000104',
   '45', 'crowned', 'Krunica metal-keramika rađena 2021.', '00000000-0000-0000-0000-000000000011'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000104',
   '46', 'missing', 'Ekstrakcija 2019. Razmatranje implantata.', '00000000-0000-0000-0000-000000000011'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000104',
   '47', 'missing', 'Ekstrakcija 2019.', '00000000-0000-0000-0000-000000000011');

-- =============================================================================
-- TERMINI — danas i sutra
-- CURRENT_DATE + time interval daje ispravno vreme bez hardcodovanog datuma
-- =============================================================================
INSERT INTO public.appointments
  (id, clinic_id, patient_id, doctor_id, starts_at, ends_at, appointment_type, title, status, arrival_status, created_by)
VALUES
  -- Danas
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000011',
   (CURRENT_DATE + INTERVAL '9 hours')::timestamptz,
   (CURRENT_DATE + INTERVAL '9 hours 30 minutes')::timestamptz,
   'regular', 'Kontrolni pregled', 'scheduled', 'not_arrived',
   '00000000-0000-0000-0000-000000000013'),

  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000011',
   (CURRENT_DATE + INTERVAL '10 hours 30 minutes')::timestamptz,
   (CURRENT_DATE + INTERVAL '11 hours 30 minutes')::timestamptz,
   'regular', 'Ispun zub 21', 'scheduled', 'not_arrived',
   '00000000-0000-0000-0000-000000000013'),

  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000012',
   (CURRENT_DATE + INTERVAL '14 hours')::timestamptz,
   (CURRENT_DATE + INTERVAL '14 hours 45 minutes')::timestamptz,
   'followup', 'Kontrola parodonta', 'scheduled', 'not_arrived',
   '00000000-0000-0000-0000-000000000013'),

  -- Sutra
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000011',
   (CURRENT_DATE + INTERVAL '1 day 9 hours 30 minutes')::timestamptz,
   (CURRENT_DATE + INTERVAL '1 day 10 hours 30 minutes')::timestamptz,
   'consultation', 'Konsultacija protetika', 'scheduled', 'not_arrived',
   '00000000-0000-0000-0000-000000000013'),

  ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000012',
   (CURRENT_DATE + INTERVAL '1 day 11 hours')::timestamptz,
   (CURRENT_DATE + INTERVAL '1 day 11 hours 30 minutes')::timestamptz,
   'urgent', 'Hitna ekstrakcija', 'scheduled', 'not_arrived',
   '00000000-0000-0000-0000-000000000013');

-- =============================================================================
-- POSETE — 3 završene posete iz prošlosti
-- =============================================================================
INSERT INTO public.visits
  (id, clinic_id, patient_id, doctor_id, visit_date, started_at, ended_at,
   chief_complaint, clinical_notes, diagnosis, status, completed_at, completed_by, created_by)
VALUES
  -- Poseta 1: Stefan Marković, 2 nedelje unazad
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000011',
   CURRENT_DATE - INTERVAL '14 days',
   (CURRENT_DATE - INTERVAL '14 days' + INTERVAL '10 hours')::timestamptz,
   (CURRENT_DATE - INTERVAL '14 days' + INTERVAL '10 hours 45 minutes')::timestamptz,
   'Bol u predelu donjeg levog molara',
   'Pacijent se žali na bol pri žvakanju u predelu 36. Perkusija pozitivna. Rendgen pokazuje karijes koji se širi prema pulpi. Razgovarano o opcijama lečenja — pacijent pristao na devitalizaciju.',
   'Karijozna lezija 36 sa mogućom pulpitisom',
   'completed',
   (CURRENT_DATE - INTERVAL '14 days' + INTERVAL '10 hours 45 minutes')::timestamptz,
   '00000000-0000-0000-0000-000000000011',
   '00000000-0000-0000-0000-000000000011'),

  -- Poseta 2: Milica Jovanović, mesec dana unazad
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000011',
   CURRENT_DATE - INTERVAL '30 days',
   (CURRENT_DATE - INTERVAL '30 days' + INTERVAL '9 hours')::timestamptz,
   (CURRENT_DATE - INTERVAL '30 days' + INTERVAL '10 hours')::timestamptz,
   'Redovni pregled i čišćenje',
   'Pacijentkinja bez tegoba. Pregled pokazuje uredan nalaz. Uklonjen kamenac gornje i donje vilice. Instrukcija o oralnoj higijeni.',
   'Zdrave vilice, gingivitis u blagoj formi',
   'completed',
   (CURRENT_DATE - INTERVAL '30 days' + INTERVAL '10 hours')::timestamptz,
   '00000000-0000-0000-0000-000000000011',
   '00000000-0000-0000-0000-000000000011'),

  -- Poseta 3: Petar Nikolić, 3 meseca unazad — kontrola parodonta
  ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000012',
   CURRENT_DATE - INTERVAL '90 days',
   (CURRENT_DATE - INTERVAL '90 days' + INTERVAL '14 hours')::timestamptz,
   (CURRENT_DATE - INTERVAL '90 days' + INTERVAL '15 hours')::timestamptz,
   'Kontrola parodonta — tromesečna poseta',
   'Parodontalni status stabilan u poređenju sa prethodnom kontrolom. Pacijent redovno flossira. Krvarenost pri probi redukovana. Preporučeno nastaviti sa terapijskim programom. Kontrola za 3 meseca.',
   'Hronični parodontitis u remisiji',
   'completed',
   (CURRENT_DATE - INTERVAL '90 days' + INTERVAL '15 hours')::timestamptz,
   '00000000-0000-0000-0000-000000000012',
   '00000000-0000-0000-0000-000000000012');

-- =============================================================================
-- PROCEDURE POSETA
-- =============================================================================
INSERT INTO public.visit_procedures
  (clinic_id, visit_id, patient_id, doctor_id, service_id, tooth_fdi, description, price, created_by)
VALUES
  -- Poseta 1 (Stefan) — pregled + rendgen
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000401',
   '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000011',
   '00000000-0000-0000-0000-000000000201', null, 'Stomatološki pregled', 600.00,
   '00000000-0000-0000-0000-000000000011'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000401',
   '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000011',
   '00000000-0000-0000-0000-000000000203', '36', 'Rendgen zuba 36', 800.00,
   '00000000-0000-0000-0000-000000000011'),

  -- Poseta 2 (Milica) — pregled + kamenac
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000402',
   '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000011',
   '00000000-0000-0000-0000-000000000201', null, 'Stomatološki pregled', 600.00,
   '00000000-0000-0000-0000-000000000011'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000402',
   '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000011',
   '00000000-0000-0000-0000-000000000213', null, 'Uklanjanje kamenca', 2500.00,
   '00000000-0000-0000-0000-000000000011'),

  -- Poseta 3 (Petar) — parodontalni pregled
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000403',
   '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000012',
   '00000000-0000-0000-0000-000000000202', null, 'Parodontalni pregled i kontrola', 1000.00,
   '00000000-0000-0000-0000-000000000012'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000403',
   '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000012',
   '00000000-0000-0000-0000-000000000213', null, 'Subgingivalni debridman', 2500.00,
   '00000000-0000-0000-0000-000000000012');

-- =============================================================================
-- PLANOVI LEČENJA
-- =============================================================================
INSERT INTO public.treatment_plans
  (id, clinic_id, patient_id, doctor_id, title, description, status, estimated_total, created_by)
VALUES
  -- Plan za Stefana — aktivni plan
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000011',
   'Plan lečenja — zub 36 i 46',
   'Lečenje karijesa zuba 36 i finalizacija endodontski lečenog zuba 46 krunicom.',
   'in_progress', 46000.00, '00000000-0000-0000-0000-000000000011'),

  -- Plan za Jovanu — predloženi plan
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000011',
   'Protetska rehabilitacija — donja vilica',
   'Nadoknada zuba 46 i 47 implanto-protetskim radom ili mostom.',
   'proposed', 90000.00, '00000000-0000-0000-0000-000000000011');

INSERT INTO public.treatment_plan_items
  (clinic_id, treatment_plan_id, service_id, tooth_fdi, description, estimated_price, status, sort_order)
VALUES
  -- Stefan — stavke plana
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501',
   '00000000-0000-0000-0000-000000000207', '36', 'Devitalizacija zuba 36', 3000.00, 'planned', 1),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501',
   '00000000-0000-0000-0000-000000000208', '36', 'Endodontsko lečenje zuba 36 (2 kanala)', 16000.00, 'planned', 2),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501',
   '00000000-0000-0000-0000-000000000211', '46', 'Krunica metal-keramika na zubu 46', 35000.00, 'in_progress', 3),

  -- Jovana — stavke plana
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000502',
   '00000000-0000-0000-0000-000000000211', '45', 'Krunica metal-keramika na oslonačnom zubu 45', 35000.00, 'planned', 1),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000502',
   null, '46-47', 'Most 3 člana 45-46-47 (alternativa implantatu)', 70000.00, 'planned', 2);
