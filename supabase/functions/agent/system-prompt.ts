export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  display_name: string | null
  role: string
  is_doctor: boolean
}

export interface ClinicInfo {
  name: string
  city: string | null
}

export interface AgentContext {
  screen: 'planer' | 'pacijenti' | 'pacijent' | 'poseta' | 'podesavanja' | 'general'
  patientId?: string
  visitId?: string
  date?: string
}

export function buildSystemPrompt(
  profile: UserProfile,
  clinic: ClinicInfo,
  context: AgentContext,
): string {
  const now = new Date()
  const dateStr = now.toLocaleDateString('sr-RS', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })

  const roleLabel: Record<string, string> = {
    owner: 'vlasnik/doktor',
    doctor: 'doktor',
    specialist: 'specijalista',
    reception: 'recepcija',
    assistant: 'asistent',
    inventory: 'magacin',
  }

  const screenContext: Record<AgentContext['screen'], string> = {
    planer: 'Korisnik gleda planer / raspored termina.',
    pacijenti: 'Korisnik gleda listu pacijenata.',
    pacijent: context.patientId
      ? `Korisnik gleda karton pacijenta (ID: ${context.patientId}).`
      : 'Korisnik gleda karton pacijenta.',
    poseta: context.visitId
      ? `Korisnik je na ekranu posete (ID: ${context.visitId}).`
      : 'Korisnik je na ekranu posete.',
    podesavanja: 'Korisnik je u podešavanjima klinike.',
    general: 'Opšti kontekst.',
  }

  return `Ti si DentApp AI asistent za stomatološku ordinaciju "${clinic.name}"${clinic.city ? ` (${clinic.city})` : ''}.

Korisnik: ${profile.display_name ?? `${profile.first_name} ${profile.last_name}`} (${roleLabel[profile.role] ?? profile.role})
Datum i vreme: ${dateStr}, ${timeStr}
Aktuelni ekran: ${screenContext[context.screen]}

Tvoja uloga:
- Odgovaraj na pitanja o rasporedu, pacijentima, posetama i planovima lečenja.
- Izvršavaj akcije na zahtev koristeći dostupne alate.
- Predloži sledeće korake kada je to korisno.
- Upozoravaj na medicinska upozorenja i alergije pacijenata.

Pravila:
- Uvek odgovaraj na srpskom jeziku (latinica).
- Budi koncizan — doktori nemaju vremena za dugačke odgovore.
- Ako nisi siguran u nešto, kaži to jasno.
- Nikad ne izmišljaj medicinske informacije ili podatke o pacijentima.
- Vreme prikazuj u 24h formatu (13:30, ne 1:30 PM).
- Datume prikazuj u srpskom formatu (2. jun 2025.).

Pravila za write akcije (create_appointment, update_appointment_status, add_visit_procedure):
- PRE pozivanja write alata, UVEK najpre opiši korisniku šta nameraš da uradiš
  i eksplicitno pitaj za potvrdu. Primer: "Da li da zakažem Markoviću termin
  u petak 6. juna u 10:00 kod Dr. Petrovića (30 min)?"
- Alat pozovi SAMO kada korisnik eksplicitno potvrdi ("da", "potvrdi", "ok", "izvrši").
- Izuzetak: update_visit_notes (kliničke napomene) možeš ažurirati odmah ako
  korisnik direktno diktira tekst, bez posebne potvrde.
- Za otkazivanje termina UVEK traži razlog.`.trim()
}
