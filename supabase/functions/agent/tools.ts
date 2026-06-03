import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

export interface ToolContext {
  userId: string
  clinicId: string
}

// ─── Sve definicije alata (za Anthropic API) ──────────────────────────────────

export const toolDefinitions = [
  // ── Read ──────────────────────────────────────────────────────────────────
  {
    name: 'get_doctors',
    description:
      'Vraća listu aktivnih doktora u klinici sa njihovim ID-jevima, imenima i specijalizacijama. ' +
      'Pozovi UVEK pre zakazivanja termina ako ne znaš ID doktora.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'get_today_schedule',
    description:
      'Vraća listu termina za danas za aktuelnu kliniku, sortirano po vremenu. ' +
      'Koristi za pitanja o rasporedu, sledećem pacijentu, zauzetosti dana.',
    input_schema: {
      type: 'object',
      properties: {
        doctor_id: {
          type: 'string',
          description: 'ID doktora — ako nije prosleđen, vraća termine svih doktora.',
        },
      },
    },
  },
  {
    name: 'get_patient_summary',
    description:
      'Vraća kompaktni pregled pacijenta: osnovi podaci, medicinska upozorenja, ' +
      'alergije, poslednja poseta, aktivan plan lečenja.',
    input_schema: {
      type: 'object',
      properties: {
        patient_id: { type: 'string', description: 'UUID pacijenta.' },
      },
      required: ['patient_id'],
    },
  },
  {
    name: 'search_patients',
    description: 'Pretražuje pacijente po imenu, prezimenu ili broju telefona.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Tekst za pretragu.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_available_slots',
    description:
      'Vraća zakazane termine za doktora na određeni dan. ' +
      'Na osnovu toga možeš zaključiti slobodne termine (radno vreme 08:00–18:00, slot 30 min).',
    input_schema: {
      type: 'object',
      properties: {
        doctor_id: { type: 'string', description: 'UUID doktora.' },
        date: { type: 'string', description: 'Datum u formatu YYYY-MM-DD.' },
      },
      required: ['doctor_id', 'date'],
    },
  },

  // ── Write ─────────────────────────────────────────────────────────────────
  {
    name: 'create_appointment',
    description:
      'Kreira novi termin u planeru. ' +
      'UVEK pitaj za potvrdu pre pozivanja ovog alata.',
    input_schema: {
      type: 'object',
      properties: {
        patient_id: { type: 'string', description: 'UUID pacijenta.' },
        doctor_id: { type: 'string', description: 'UUID doktora.' },
        starts_at: {
          type: 'string',
          description: 'Datum i vreme početka, ISO 8601 format (npr. 2025-06-10T10:00:00).',
        },
        duration_min: {
          type: 'number',
          description: 'Trajanje u minutima (15, 30, 45, 60, 90, 120). Default: 30.',
        },
        appointment_type: {
          type: 'string',
          enum: ['regular', 'urgent', 'followup', 'consultation', 'specialist'],
          description: 'Tip termina. Default: regular.',
        },
        notes: { type: 'string', description: 'Napomena za termin (opciono).' },
      },
      required: ['patient_id', 'doctor_id', 'starts_at'],
    },
  },
  {
    name: 'update_appointment_status',
    description:
      'Menja operativni status termina (dolazak, otkazivanje, no-show). ' +
      'Za otkazivanje uvek pitaj za potvrdu i razlog.',
    input_schema: {
      type: 'object',
      properties: {
        appointment_id: { type: 'string', description: 'UUID termina.' },
        arrival_status: {
          type: 'string',
          enum: ['arrived', 'in_chair', 'completed'],
          description: 'Operativni status dolaska.',
        },
        status: {
          type: 'string',
          enum: ['completed', 'cancelled', 'no_show'],
          description: 'Životni status termina.',
        },
        cancellation_reason: {
          type: 'string',
          description: 'Razlog otkazivanja (obavezan za status=cancelled).',
        },
      },
      required: ['appointment_id'],
    },
  },
  {
    name: 'update_visit_notes',
    description:
      'Ažurira kliničke napomene aktivne (draft) posete. ' +
      'Koristi kada doktor diktira nalaz ili dijagnozu.',
    input_schema: {
      type: 'object',
      properties: {
        visit_id: { type: 'string', description: 'UUID posete (mora biti draft status).' },
        chief_complaint: { type: 'string', description: 'Razlog posete.' },
        diagnosis: { type: 'string', description: 'Dijagnoza (slobodan tekst).' },
        clinical_notes: { type: 'string', description: 'Kliničke napomene doktora.' },
      },
      required: ['visit_id'],
    },
  },
  {
    name: 'add_visit_procedure',
    description:
      'Dodaje urađenu proceduru na aktivnu posetу. ' +
      'Koristi kada doktor kaže šta je radio na kojim zubu.',
    input_schema: {
      type: 'object',
      properties: {
        visit_id: { type: 'string', description: 'UUID posete.' },
        description: { type: 'string', description: 'Opis procedure (npr. Plomba kompozit).' },
        tooth_fdi: {
          type: 'string',
          description: 'FDI oznaka zuba (npr. 36). Opciono.',
        },
        price: { type: 'number', description: 'Cena u RSD. Opciono.' },
      },
      required: ['visit_id', 'description'],
    },
  },
]

// ─── Dispečer ─────────────────────────────────────────────────────────────────

export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  supabase: SupabaseClient,
  serviceSupabase: SupabaseClient,
  ctx: ToolContext,
): Promise<unknown> {
  const str = (v: unknown) => (typeof v === 'string' ? v : '')
  const num = (v: unknown, def: number) => (typeof v === 'number' ? v : def)

  switch (name) {
    case 'get_doctors':
      return getDoctors(supabase)
    case 'get_today_schedule':
      return getTodaySchedule(str(input.doctor_id) || null, supabase)
    case 'get_patient_summary':
      return getPatientSummary(str(input.patient_id), supabase)
    case 'search_patients':
      return searchPatients(str(input.query), supabase)
    case 'get_available_slots':
      return getAvailableSlots(str(input.doctor_id), str(input.date), supabase)
    case 'create_appointment':
      return createAppointment(
        {
          patientId: str(input.patient_id),
          doctorId: str(input.doctor_id),
          startsAt: str(input.starts_at),
          durationMin: num(input.duration_min, 30),
          appointmentType: str(input.appointment_type) || 'regular',
          notes: str(input.notes) || null,
        },
        supabase,
        serviceSupabase,
        ctx,
      )
    case 'update_appointment_status':
      return updateAppointmentStatus(
        {
          appointmentId: str(input.appointment_id),
          arrivalStatus: str(input.arrival_status) || null,
          status: str(input.status) || null,
          cancellationReason: str(input.cancellation_reason) || null,
        },
        supabase,
        serviceSupabase,
        ctx,
      )
    case 'update_visit_notes':
      return updateVisitNotes(
        {
          visitId: str(input.visit_id),
          chiefComplaint: str(input.chief_complaint) || null,
          diagnosis: str(input.diagnosis) || null,
          clinicalNotes: str(input.clinical_notes) || null,
        },
        supabase,
        serviceSupabase,
        ctx,
      )
    case 'add_visit_procedure':
      return addVisitProcedure(
        {
          visitId: str(input.visit_id),
          description: str(input.description),
          toothFdi: str(input.tooth_fdi) || null,
          price: typeof input.price === 'number' ? input.price : null,
        },
        supabase,
        serviceSupabase,
        ctx,
      )
    default:
      return { error: `Nepoznat alat: ${name}` }
  }
}

// ─── Read handlers ────────────────────────────────────────────────────────────

async function getDoctors(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, display_name, specialty, role, color')
    .eq('is_doctor', true)
    .eq('is_active', true)
    .order('last_name')

  if (error) return { error: error.message }

  return {
    count: data?.length ?? 0,
    doctors: (data ?? []).map((d) => ({
      id: d.id,
      name: d.display_name ?? `${d.last_name} ${d.first_name}`,
      first_name: d.first_name,
      last_name: d.last_name,
      specialty: d.specialty,
      role: d.role,
    })),
  }
}

async function getTodaySchedule(doctorId: string | null, supabase: SupabaseClient) {
  const today = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('appointments')
    .select(`
      id, starts_at, ends_at, duration_min, appointment_type,
      status, arrival_status, notes,
      patient:patients ( id, first_name, last_name, phone ),
      doctor:profiles!doctor_id ( id, first_name, last_name, display_name )
    `)
    .gte('starts_at', `${today}T00:00:00+00:00`)
    .lte('starts_at', `${today}T23:59:59+00:00`)
    .not('status', 'eq', 'cancelled')
    .order('starts_at')

  if (doctorId) query = query.eq('doctor_id', doctorId)

  const { data, error } = await query
  if (error) return { error: error.message }

  type Appt = typeof data extends (infer T)[] | null ? T : never
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })

  return {
    date: today,
    count: data?.length ?? 0,
    appointments: (data ?? []).map((a: Appt) => {
      const p = a.patient as { id: string; first_name: string; last_name: string; phone: string | null } | null
      const d = a.doctor as { display_name: string | null; first_name: string; last_name: string } | null
      return {
        id: a.id,
        time: fmt(a.starts_at as string),
        ends: fmt(a.ends_at as string),
        duration_min: a.duration_min,
        type: a.appointment_type,
        status: a.status,
        arrival: a.arrival_status,
        patient: p ? { id: p.id, name: `${p.last_name} ${p.first_name}`, phone: p.phone } : null,
        doctor: d ? (d.display_name ?? `${d.first_name} ${d.last_name}`) : null,
        notes: a.notes,
      }
    }),
  }
}

async function getPatientSummary(patientId: string, supabase: SupabaseClient) {
  const [patientRes, medicalRes, lastVisitRes, planRes] = await Promise.all([
    supabase
      .from('patients')
      .select('id, first_name, last_name, date_of_birth, phone, notes')
      .eq('id', patientId)
      .maybeSingle(),
    supabase
      .from('patient_medical_records')
      .select('medical_alerts, allergies, medications, systemic_diseases')
      .eq('patient_id', patientId)
      .maybeSingle(),
    supabase
      .from('visits')
      .select('id, visit_date, chief_complaint, diagnosis, status')
      .eq('patient_id', patientId)
      .eq('status', 'completed')
      .order('visit_date', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('treatment_plans')
      .select('id, title, status, estimated_total, items:treatment_plan_items(id, description, tooth_fdi, status, estimated_price)')
      .eq('patient_id', patientId)
      .in('status', ['accepted', 'in_progress', 'proposed'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (!patientRes.data) return { error: 'Pacijent nije pronađen.' }

  const p = patientRes.data
  const age = p.date_of_birth
    ? Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null

  type PlanItem = { id: string; description: string; tooth_fdi: string | null; status: string; estimated_price: number | null }

  return {
    patient: { id: p.id, name: `${p.last_name} ${p.first_name}`, age, phone: p.phone, notes: p.notes },
    medical: medicalRes.data
      ? { alerts: medicalRes.data.medical_alerts, allergies: medicalRes.data.allergies, medications: medicalRes.data.medications, systemic_diseases: medicalRes.data.systemic_diseases }
      : null,
    last_visit: lastVisitRes.data
      ? { id: lastVisitRes.data.id, date: lastVisitRes.data.visit_date, chief_complaint: lastVisitRes.data.chief_complaint, diagnosis: lastVisitRes.data.diagnosis }
      : null,
    active_plan: planRes.data
      ? {
          id: planRes.data.id, title: planRes.data.title, status: planRes.data.status,
          estimated_total: planRes.data.estimated_total,
          pending_items: (planRes.data.items as PlanItem[]).filter(i => i.status === 'planned' || i.status === 'in_progress').slice(0, 5),
        }
      : null,
  }
}

// Identično sa normalizeSr() u src/lib/normalizeSr.ts i normalize_sr() u DB
function normalizeSr(input: string): string {
  return input
    .replace(/Š/g, 'S').replace(/š/g, 's')
    .replace(/Č/g, 'C').replace(/č/g, 'c')
    .replace(/Ć/g, 'C').replace(/ć/g, 'c')
    .replace(/Ž/g, 'Z').replace(/ž/g, 'z')
    .replace(/Đ/g, 'DJ').replace(/đ/g, 'dj')
    .toLowerCase()
}

async function searchPatients(query: string, supabase: SupabaseClient) {
  if (!query.trim()) return { patients: [] }
  const t = query.trim()
  // Normalizuj query identično kao search_text kolona u bazi:
  // search_text = normalize_sr("ime prezime prezime ime") → "ilic bojan bojan ilic"
  // Pretraga po search_text hvata i delimično ime, i oba redosled.
  const norm = normalizeSr(t)
  const { data, error } = await supabase
    .from('patients')
    .select('id, first_name, last_name, date_of_birth, phone')
    .or(`search_text.ilike.%${norm}%,phone.ilike.%${t}%`)
    .is('deleted_at', null)
    .limit(10)
  if (error) return { error: error.message }
  return {
    query: t,
    count: data?.length ?? 0,
    patients: (data ?? []).map(p => ({ id: p.id, name: `${p.last_name} ${p.first_name}`, phone: p.phone, date_of_birth: p.date_of_birth })),
  }
}

async function getAvailableSlots(doctorId: string, date: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('appointments')
    .select('starts_at, ends_at, duration_min, status')
    .eq('doctor_id', doctorId)
    .gte('starts_at', `${date}T00:00:00+00:00`)
    .lte('starts_at', `${date}T23:59:59+00:00`)
    .not('status', 'eq', 'cancelled')
    .order('starts_at')
  if (error) return { error: error.message }
  const fmt = (iso: string) => new Date(iso).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
  return {
    date, doctor_id: doctorId,
    working_hours: { start: '08:00', end: '18:00' },
    slot_duration_min: 30,
    booked: (data ?? []).map(a => ({ start: fmt(a.starts_at), end: fmt(a.ends_at), duration_min: a.duration_min, status: a.status })),
  }
}

// ─── Write handlers ───────────────────────────────────────────────────────────

async function createAppointment(
  input: { patientId: string; doctorId: string; startsAt: string; durationMin: number; appointmentType: string; notes: string | null },
  supabase: SupabaseClient,
  serviceSupabase: SupabaseClient,
  ctx: ToolContext,
) {
  if (!input.patientId || !input.doctorId || !input.startsAt) {
    return { error: 'Nedostaju obavezna polja: patient_id, doctor_id, starts_at.' }
  }

  const startsAt = new Date(input.startsAt)
  if (isNaN(startsAt.getTime())) return { error: 'Neispravan format datuma/vremena.' }

  const endsAt = new Date(startsAt.getTime() + input.durationMin * 60_000)

  // Provera preklapanja
  const { data: overlapping } = await supabase
    .from('appointments')
    .select('id, starts_at')
    .eq('doctor_id', input.doctorId)
    .not('status', 'eq', 'cancelled')
    .lt('starts_at', endsAt.toISOString())
    .gt('ends_at', startsAt.toISOString())

  if (overlapping && overlapping.length > 0) {
    return { error: 'Doktor već ima termin u tom terminu. Izaberi drugi termin.' }
  }

  // Dohvati clinic_id iz pacijenta
  const { data: patient } = await supabase.from('patients').select('clinic_id').eq('id', input.patientId).maybeSingle()
  if (!patient) return { error: 'Pacijent nije pronađen.' }

  const { data: appt, error } = await supabase
    .from('appointments')
    .insert({
      clinic_id: patient.clinic_id,
      patient_id: input.patientId,
      doctor_id: input.doctorId,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      appointment_type: input.appointmentType,
      notes: input.notes,
      status: 'scheduled',
      arrival_status: 'not_arrived',
      created_by: ctx.userId,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  await serviceSupabase.from('audit_log').insert({
    clinic_id: patient.clinic_id,
    user_id: ctx.userId,
    action: 'appointment.created',
    entity_type: 'appointments',
    entity_id: appt.id,
    new_data: { patient_id: input.patientId, doctor_id: input.doctorId, starts_at: startsAt.toISOString(), source: 'agent' },
  })

  return {
    success: true,
    appointment_id: appt.id,
    message: `Termin zakazan: ${startsAt.toLocaleDateString('sr-RS')} u ${startsAt.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}, trajanje ${input.durationMin} min.`,
  }
}

async function updateAppointmentStatus(
  input: { appointmentId: string; arrivalStatus: string | null; status: string | null; cancellationReason: string | null },
  supabase: SupabaseClient,
  serviceSupabase: SupabaseClient,
  ctx: ToolContext,
) {
  const { data: current } = await supabase
    .from('appointments')
    .select('id, clinic_id, status, arrival_status, patient_id')
    .eq('id', input.appointmentId)
    .maybeSingle()

  if (!current) return { error: 'Termin nije pronađen.' }

  const updates: Record<string, unknown> = {}
  if (input.arrivalStatus) updates.arrival_status = input.arrivalStatus
  if (input.status) {
    updates.status = input.status
    if (input.status === 'cancelled') {
      updates.cancelled_by = ctx.userId
      if (input.cancellationReason) updates.cancellation_reason = input.cancellationReason
    }
  }

  if (Object.keys(updates).length === 0) return { error: 'Nema polja za ažuriranje.' }

  const { error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', input.appointmentId)

  if (error) return { error: error.message }

  await serviceSupabase.from('audit_log').insert({
    clinic_id: current.clinic_id,
    user_id: ctx.userId,
    action: 'appointment.status_updated',
    entity_type: 'appointments',
    entity_id: input.appointmentId,
    old_data: { status: current.status, arrival_status: current.arrival_status },
    new_data: { ...updates, source: 'agent' },
  })

  return { success: true, message: 'Status termina ažuriran.' }
}

async function updateVisitNotes(
  input: { visitId: string; chiefComplaint: string | null; diagnosis: string | null; clinicalNotes: string | null },
  supabase: SupabaseClient,
  serviceSupabase: SupabaseClient,
  ctx: ToolContext,
) {
  const { data: visit } = await supabase
    .from('visits')
    .select('id, clinic_id, status, chief_complaint, diagnosis, clinical_notes')
    .eq('id', input.visitId)
    .maybeSingle()

  if (!visit) return { error: 'Poseta nije pronađena.' }
  if (visit.status !== 'draft') return { error: 'Poseta je već završena — nije moguće menjati napomene.' }

  const updates: Record<string, unknown> = {}
  if (input.chiefComplaint !== null) updates.chief_complaint = input.chiefComplaint
  if (input.diagnosis !== null) updates.diagnosis = input.diagnosis
  if (input.clinicalNotes !== null) updates.clinical_notes = input.clinicalNotes

  if (Object.keys(updates).length === 0) return { error: 'Nema polja za ažuriranje.' }

  const { error } = await supabase.from('visits').update(updates).eq('id', input.visitId)
  if (error) return { error: error.message }

  await serviceSupabase.from('audit_log').insert({
    clinic_id: visit.clinic_id,
    user_id: ctx.userId,
    action: 'visit.notes_updated',
    entity_type: 'visits',
    entity_id: input.visitId,
    old_data: { chief_complaint: visit.chief_complaint, diagnosis: visit.diagnosis, clinical_notes: visit.clinical_notes },
    new_data: { ...updates, source: 'agent' },
  })

  return { success: true, message: 'Napomene posete ažurirane.' }
}

async function addVisitProcedure(
  input: { visitId: string; description: string; toothFdi: string | null; price: number | null },
  supabase: SupabaseClient,
  serviceSupabase: SupabaseClient,
  ctx: ToolContext,
) {
  if (!input.description.trim()) return { error: 'Opis procedure je obavezan.' }

  const { data: visit } = await supabase
    .from('visits')
    .select('id, clinic_id, patient_id, doctor_id, status')
    .eq('id', input.visitId)
    .maybeSingle()

  if (!visit) return { error: 'Poseta nije pronađena.' }
  if (visit.status !== 'draft') return { error: 'Poseta je završena — nije moguće dodavati procedure.' }

  const { data: proc, error } = await supabase
    .from('visit_procedures')
    .insert({
      clinic_id: visit.clinic_id,
      visit_id: input.visitId,
      patient_id: visit.patient_id,
      doctor_id: visit.doctor_id,
      description: input.description.trim(),
      tooth_fdi: input.toothFdi,
      price: input.price,
      created_by: ctx.userId,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  await serviceSupabase.from('audit_log').insert({
    clinic_id: visit.clinic_id,
    user_id: ctx.userId,
    action: 'visit_procedure.created',
    entity_type: 'visit_procedures',
    entity_id: proc.id,
    new_data: { description: input.description, tooth_fdi: input.toothFdi, price: input.price, source: 'agent' },
  })

  return {
    success: true,
    procedure_id: proc.id,
    message: `Procedura dodana: "${input.description}"${input.toothFdi ? ` (zub ${input.toothFdi})` : ''}.`,
  }
}
