import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verifikacija — pozivalac mora biti owner
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return err('Nedostaje Authorization.', 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    })
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    const { data: { user }, error: authErr } = await userClient.auth.getUser()
    if (authErr || !user) return err('Neautorizovano.', 401)

    const callerRole = user.app_metadata?.role as string
    if (callerRole !== 'owner') return err('Samo vlasnik može pozivati korisnike.', 403)

    const clinicId = user.app_metadata?.clinic_id as string
    if (!clinicId) return err('Klinika nije pronađena.', 403)

    // Parsiranje zahteva
    const body = await req.json()
    const { email, first_name, last_name, role } = body as {
      email: string; first_name: string; last_name: string; role: string
    }

    if (!email || !first_name || !last_name || !role) {
      return err('Nedostaju obavezna polja: email, first_name, last_name, role.', 400)
    }

    const validRoles = ['owner', 'doctor', 'specialist', 'assistant', 'reception', 'inventory']
    if (!validRoles.includes(role)) return err('Nepoznata uloga.', 400)

    // Kreiraj auth korisnika sa app_metadata (za RLS)
    const { data: newUser, error: createErr } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { first_name, last_name },
      redirectTo: `${req.headers.get('origin') ?? 'http://localhost:5173'}/login`,
    })

    if (createErr || !newUser.user) {
      return err(createErr?.message ?? 'Greška pri kreiranju korisnika.', 400)
    }

    // Postavi app_metadata (clinic_id + role) — potrebno za RLS
    await adminClient.auth.admin.updateUserById(newUser.user.id, {
      app_metadata: { clinic_id: clinicId, role },
    })

    // Kreiraj profil
    const { error: profileErr } = await adminClient.from('profiles').insert({
      id: newUser.user.id,
      clinic_id: clinicId,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      role,
      is_doctor: ['doctor', 'specialist'].includes(role),
      is_active: true,
    })

    if (profileErr) {
      // Rollback: obriši auth korisnika ako profil nije kreiran
      await adminClient.auth.admin.deleteUser(newUser.user.id)
      return err('Greška pri kreiranju profila.', 500)
    }

    return new Response(
      JSON.stringify({ message: `Pozivnica je poslata na ${email}.`, user_id: newUser.user.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Neočekivana greška.', 500)
  }
})

function err(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
