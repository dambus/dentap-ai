import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { buildSystemPrompt } from './system-prompt.ts'
import { toolDefinitions, executeTool } from './tools.ts'
import type { AgentContext } from './system-prompt.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ─── 1. Verifikacija JWT ───────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return errorResponse('Nedostaje Authorization header.', 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // User JWT client — RLS filtrira po klinici
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    })

    // Service role client — SAMO za audit_log (nema INSERT policy za authenticated)
    const serviceSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return errorResponse('Neautorizovani pristup.', 401)

    // ─── 2. Profil i klinika ──────────────────────────────────────────────
    const [profileRes, clinicRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, first_name, last_name, display_name, role, is_doctor, clinic_id')
        .eq('id', user.id)
        .single(),
      supabase
        .from('clinics')
        .select('name, city')
        .eq('id', user.app_metadata?.clinic_id ?? '')
        .maybeSingle(),
    ])

    if (profileRes.error || !profileRes.data) return errorResponse('Profil nije pronađen.', 403)

    const profile = profileRes.data
    const clinic = clinicRes.data ?? { name: 'Klinika', city: null }
    const clinicId = (user.app_metadata?.clinic_id as string) ?? ''

    // ─── 3. Request body ──────────────────────────────────────────────────
    const body = await req.json()
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = body.messages ?? []
    const context: AgentContext = body.context ?? { screen: 'general' }

    if (!messages.length) return errorResponse('Nema poruka.', 400)

    // ─── 4. Anthropic ─────────────────────────────────────────────────────
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) return errorResponse('ANTHROPIC_API_KEY nije podešen.', 500)

    const anthropic = new Anthropic({ apiKey: anthropicKey })
    const systemPrompt = buildSystemPrompt(profile, clinic, context)

    const conversation: Anthropic.MessageParam[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    // ─── 5. Agentic loop ──────────────────────────────────────────────────
    const toolCtx = { userId: user.id, clinicId }

    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: conversation,
      tools: toolDefinitions as Anthropic.Tool[],
    })

    const actionsTaken: Array<{ tool: string; summary: string }> = []

    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
      )

      const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
        toolUseBlocks.map(async (block) => {
          const result = await executeTool(
            block.name,
            block.input as Record<string, unknown>,
            supabase,
            serviceSupabase,
            toolCtx,
          )
          actionsTaken.push({ tool: block.name, summary: `${block.name} izvršen` })
          return {
            type: 'tool_result' as const,
            tool_use_id: block.id,
            content: JSON.stringify(result),
          }
        }),
      )

      conversation.push({ role: 'assistant', content: response.content })
      conversation.push({ role: 'user', content: toolResults })

      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: systemPrompt,
        messages: conversation,
        tools: toolDefinitions as Anthropic.Tool[],
      })
    }

    // ─── 6. Finalni odgovor ───────────────────────────────────────────────
    const finalText = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()

    return new Response(
      JSON.stringify({
        response: finalText || 'Nema odgovora od agenta.',
        actions_taken: actionsTaken,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Neočekivana greška.'
    return errorResponse(message, 500)
  }
})

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
