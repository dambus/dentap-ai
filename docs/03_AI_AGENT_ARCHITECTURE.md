# DentApp — AI Agent Arhitektura

## Pregled

Agent je centralni deo DentApp-a. Nije dodatak — to je primarni način interakcije sa sistemom.

Svaki screen u aplikaciji ima agenta dostupnog u bočnom panelu. Agent zna gde se korisnik nalazi, šta je otvoreno, i može da čita i piše podatke u bazu.

---

## Slojevi Agenta

```
┌─────────────────────────────────────────┐
│         Korisnik (chat ili voice)        │
└────────────────┬────────────────────────┘
                 │ HTTP POST
┌────────────────▼────────────────────────┐
│     Supabase Edge Function: /agent       │
│                                         │
│  1. Validacija JWT + clinic_id          │
│  2. Sastavljanje system prompta         │
│  3. Poziv Anthropic API                 │
│  4. Obrada tool_use blokova             │
│  5. Izvršavanje DB operacija            │
│  6. Vraćanje finalnog odgovora          │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
Anthropic API          Supabase DB
(claude-sonnet)        (RLS zaštita)
```

---

## Edge Function: /agent

### Request Format
```typescript
{
  messages: Array<{role: 'user'|'assistant', content: string}>,
  context: {
    screen: 'dashboard'|'planner'|'patient'|'visit'|'settings',
    patient_id?: string,
    appointment_id?: string,
    visit_id?: string,
    date?: string  // YYYY-MM-DD
  }
}
```

### Response Format
```typescript
{
  response: string,        // finalni odgovor agenta
  actions_taken: Array<{   // šta je agent uradio
    tool: string,
    result: string
  }>,
  suggestions?: Array<string>  // proaktivni predlozi
}
```

---

## System Prompt

```
Ti si DentApp AI asistent za stomatološku ordinaciju "{clinic_name}".

Korisnik: {user_display_name} ({user_role})
Datum i vreme: {current_datetime} (srpski format)

Aktuelni kontekst:
{context_description}

Tvoja uloga:
- Pomozi korisniku da brzo nađe informacije
- Izvršavaj akcije na zahtev (zakazivanje, beleženje, ažuriranje)
- Predlozi sledeće korake kada je to korisno
- Upozoravaj na bitne stvari (alergije, dugovanja, propuštene kontrole)

Pravila:
- Uvek odgovaraj na srpskom jeziku
- Budi koncizan — doktori nemaju vremena za duge odgovore
- Ako nisi siguran, pitaj pre nego što nešto menjaš u bazi
- Nikada ne izmišljaj medicinske informacije
- Za finansijske operacije uvek traži potvrdu
```

---

## Agent Tools

### Read Tools (uvek dostupni)

```typescript
get_today_schedule
// Vraća sve termine za danas za aktuelnog doktora (ili sve ako je owner)
// Input: { doctor_id?: string, date?: string }

get_patient_summary
// Vraća kompaktni kontekst pacijenta: osnovni podaci + upozorenja + poslednja poseta
// Input: { patient_id: string }

get_patient_history
// Vraća istoriju poseta pacijenta (poslednjih N)
// Input: { patient_id: string, limit?: number }

get_patient_treatment_plans
// Vraća aktivne planove lečenja
// Input: { patient_id: string }

search_patients
// Pretraga pacijenata po imenu/telefonu
// Input: { query: string }

get_appointment_detail
// Detalji termina
// Input: { appointment_id: string }

get_visit_detail
// Detalji posete
// Input: { visit_id: string }

get_available_slots
// Slobodni termini za doktora u periodu
// Input: { doctor_id: string, date_from: string, date_to: string, duration_min: number }
```

### Write Tools (zahtevaju potvrdu za destruktivne akcije)

```typescript
create_appointment
// Kreira novi termin
// Input: { patient_id, doctor_id, starts_at, duration_min, notes?, appointment_type? }

update_appointment_status
// Menja status termina (arrived, in_chair, completed, cancelled, no_show)
// Input: { appointment_id, status, reason? }

create_visit
// Kreira novu posetу (ili iz termina)
// Input: { patient_id, doctor_id, appointment_id?, visit_date, chief_complaint? }

update_visit_notes
// Dodaje/ažurira kliničke napomene
// Input: { visit_id, clinical_notes?, diagnosis? }

add_visit_procedure
// Dodaje urađenu proceduru na posetу
// Input: { visit_id, service_id?, tooth_fdi?, description, price? }

complete_visit
// Završava posetу
// Input: { visit_id }

update_patient_medical_record
// Ažurira anamnezu/alergije
// Input: { patient_id, field, value }

update_odontogram_tooth
// Menja status zuba
// Input: { patient_id, tooth_fdi, status, surfaces? }
```

### Proactive Tools (agent poziva samostalno)

```typescript
check_patient_alerts
// Proverava alergije i medicinska upozorenja pre termina
// Poziva se automatski pri otvaranju termina ili posete

suggest_followup
// Predlaže zakazivanje kontrole ako nije zakazana
// Poziva se na kraju posete
```

---

## Kontekstualna Svesnost

Agent automatski dobija drugačiji kontekst zavisno od screen-a:

### Dashboard / Planer
```
Kontekst: Raspored dana, {N} termina, {N} pacijenata čeka
Agent predlaže: "Pacijent Marić ima alergiju na penicilin, imate termin za 10:30"
```

### Karton Pacijenta
```
Kontekst: Pacijent {ime}, {starost}, poslednja poseta {datum}
Upozorenja: {alergije}, {lekovi}
Plan lečenja: {aktivan plan ako postoji}
Agent predlaže: "Prošlo je 6 meseci od poslednje kontrole. Zakazati?"
```

### Visit Screen
```
Kontekst: Poseta u toku, pacijent {ime}, doktor {ime}
Urađeno do sada: {procedure}
Agent predlaže: "Da li dodajem pregled u plan lečenja?"
```

---

## Voice Interface Priprema

### MVP: Web Speech API
```typescript
// Samo browser-native, bez API troškova
const recognition = new webkitSpeechRecognition();
recognition.lang = 'sr-RS';
recognition.continuous = false;
recognition.interimResults = true;

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  // Šalje se agentu kao normalna poruka
  sendToAgent(transcript);
};
```

### Buduće nadogradnje
- Whisper API za bolju tačnost srpskog govora
- Streaming response + TTS za voice output
- Wake word detection ("Hej DentApp...")

---

## Pacijentski Agent (Buduće, ne MVP)

Poseban agent dostupan pacijentima:
- Zakazivanje termina putem chata (SMS/Viber/Web)
- Podsetnici
- Odgovori na osnovna pitanja ordinacije
- Uvek na srpskom, ton prilagođen pacijentu

Isti backend (Edge Functions), drugačiji system prompt i tool set.

---

## Bezbednost

1. **Svaki agent poziv verifikuje JWT** — bez toga, nema pristupa
2. **clinic_id iz JWT** — agent ne može da pristupi podacima druge klinike
3. **RLS na DB nivou** — čak i ako agent napravi grešku, DB odbija zabranjeni upit
4. **Write operacije loguju se u audit_log** — sve što agent menja se beleži
5. **Sensitive akcije traže potvrdu** — brisanje, finansijske operacije, medicinska upozorenja
6. **Rate limiting na Edge Function** — prevencija zloupotrebe
