import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

// ─── Tool definicije (za Anthropic API) ───────────────────────────────────────

export const toolDefinitions = [
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
        patient_id: {
          type: 'string',
          description: 'UUID pacijenta.',
        },
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
        query: {
          type: 'string',
          description: 'Tekst za pretragu (ime, prezime ili telefon).',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_available_slots',
    description:
      'Vraća zakazane termine za doktora na određeni dan. ' +
      'Na osnovu toga možeš zaključiti slobodne termine (radno vreme: 08:00–18:00, slot 30 min).',
    input_schema: {
      type: 'object',
      properties: {
        doctor_id: {
          type: 'string',
          description: 'UUID doktora.',
        },
        date: {
          type: 'string',
          description: 'Datum u formatu YYYY-MM-DD.',
        },
      },
      required: ['doctor_id', 'date'],
    },
  },
]

// ─── Tool handleri (DB upiti) ──────────────────────────────────────────────────

export async function executeTool(
  name: string,
  input: Record<string, string>,
  supabase: SupabaseClient,
): Promise<unknown> {
  switch (name) {
    case 'get_today_schedule':
      return getTodaySchedule(input.doctor_id ?? null, supabase)
    case 'get_patient_summary':
      return getPatientSummary(input.patient_id, supabase)
    case 'search_patients':
      return searchPatients(input.query, supabase)
    case 'get_available_slots':
      return getAvailableSlots(input.doctor_id, input.date, supabase)
    default:
      return { error: `Nepoznat alat: ${name}` }
  }
}

async function getTodaySchedule(
  doctorId: string | null,
  supabase: SupabaseClient,
) {
  const today = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('appointments')
    .select(`
      id,
      starts_at,
      ends_at,
      duration_min,
      appointment_type,
      status,
      arrival_status,
      notes,
      patient:patients ( id, first_name, last_name, phone ),
      doctor:profiles!doctor_id ( id, first_name, last_name, display_name )
    `)
    .gte('starts_at', `${today}T00:00:00+00:00`)
    .lte('starts_at', `${today}T23:59:59+00:00`)
    .not('status', 'eq', 'cancelled')
    .order('starts_at')

  if (doctorId) {
    query = query.eq('doctor_id', doctorId)
  }

  const { data, error } = await query

  if (error) return { error: error.message }

  return {
    date: today,
    count: data?.length ?? 0,
    appointments: (data ?? []).map((a) => ({
      id: a.id,
      time: new Date(a.starts_at).toLocaleTimeString('sr-RS', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      ends: new Date(a.ends_at).toLocaleTimeString('sr-RS', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      duration_min: a.duration_min,
      type: a.appointment_type,
      status: a.status,
      arrival: a.arrival_status,
      patient: a.patient
        ? {
            id: (a.patient as { id: string }).id,
            name: `${(a.patient as { last_name: string }).last_name} ${(a.patient as { first_name: string }).first_name}`,
            phone: (a.patient as { phone: string | null }).phone,
          }
        : null,
      doctor: a.doctor
        ? (a.doctor as { display_name: string | null; first_name: string; last_name: string })
            .display_name ??
          `${(a.doctor as { first_name: string }).first_name} ${(a.doctor as { last_name: string }).last_name}`
        : null,
      notes: a.notes,
    })),
  }
}

async function getPatientSummary(patientId: string, supabase: SupabaseClient) {
  const [patientRes, medicalRes, lastVisitRes, planRes] = await Promise.all([
    supabase
      .from('patients')
      .select('id, first_name, last_name, date_of_birth, gender, phone, phone_alt, email, notes')
      .eq('id', patientId)
      .maybeSingle(),

    supabase
      .from('patient_medical_records')
      .select('medical_alerts, allergies, medications, systemic_diseases, general_anamnesis, dental_anamnesis')
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
      .select(`
        id, title, status, estimated_total,
        items:treatment_plan_items ( id, description, tooth_fdi, status, estimated_price )
      `)
      .eq('patient_id', patientId)
      .in('status', ['accepted', 'in_progress', 'proposed'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (patientRes.error) return { error: patientRes.error.message }
  if (!patientRes.data) return { error: 'Pacijent nije pronađen.' }

  const p = patientRes.data
  const age = p.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(p.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
      )
    : null

  return {
    patient: {
      id: p.id,
      name: `${p.last_name} ${p.first_name}`,
      age,
      phone: p.phone,
      notes: p.notes,
    },
    medical: medicalRes.data
      ? {
          alerts: medicalRes.data.medical_alerts,
          allergies: medicalRes.data.allergies,
          medications: medicalRes.data.medications,
          systemic_diseases: medicalRes.data.systemic_diseases,
        }
      : null,
    last_visit: lastVisitRes.data
      ? {
          id: lastVisitRes.data.id,
          date: lastVisitRes.data.visit_date,
          chief_complaint: lastVisitRes.data.chief_complaint,
          diagnosis: lastVisitRes.data.diagnosis,
        }
      : null,
    active_plan: planRes.data
      ? {
          id: planRes.data.id,
          title: planRes.data.title,
          status: planRes.data.status,
          estimated_total: planRes.data.estimated_total,
          pending_items: (
            planRes.data.items as Array<{
              id: string
              description: string
              tooth_fdi: string | null
              status: string
              estimated_price: number | null
            }>
          )
            .filter((i) => i.status === 'planned' || i.status === 'in_progress')
            .slice(0, 5),
        }
      : null,
  }
}

async function searchPatients(query: string, supabase: SupabaseClient) {
  const term = query.trim()
  if (!term) return { patients: [] }

  const { data, error } = await supabase
    .from('patients')
    .select('id, first_name, last_name, date_of_birth, phone')
    .or(
      `last_name.ilike.%${term}%,first_name.ilike.%${term}%,phone.ilike.%${term}%`,
    )
    .is('deleted_at', null)
    .limit(10)

  if (error) return { error: error.message }

  return {
    query: term,
    count: data?.length ?? 0,
    patients: (data ?? []).map((p) => ({
      id: p.id,
      name: `${p.last_name} ${p.first_name}`,
      phone: p.phone,
      date_of_birth: p.date_of_birth,
    })),
  }
}

async function getAvailableSlots(
  doctorId: string,
  date: string,
  supabase: SupabaseClient,
) {
  const { data, error } = await supabase
    .from('appointments')
    .select('starts_at, ends_at, duration_min, status')
    .eq('doctor_id', doctorId)
    .gte('starts_at', `${date}T00:00:00+00:00`)
    .lte('starts_at', `${date}T23:59:59+00:00`)
    .not('status', 'eq', 'cancelled')
    .order('starts_at')

  if (error) return { error: error.message }

  return {
    date,
    doctor_id: doctorId,
    working_hours: { start: '08:00', end: '18:00' },
    slot_duration_min: 30,
    booked: (data ?? []).map((a) => ({
      start: new Date(a.starts_at).toLocaleTimeString('sr-RS', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      end: new Date(a.ends_at).toLocaleTimeString('sr-RS', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      duration_min: a.duration_min,
      status: a.status,
    })),
  }
}
