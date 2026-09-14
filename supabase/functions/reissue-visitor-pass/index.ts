import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    const body = await req.json()
    const { personId, vals, registeredBy } = body

    const tokenChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let token = ''
    for (let i = 0; i < 10; i++) token += tokenChars[Math.floor(Math.random() * tokenChars.length)]

    const { data: existing, error: findError } = await supabaseClient
      .from('people')
      .select('*')
      .eq('id', personId)
      .single()

    if (findError || !existing) throw new Error("Person not found")

    const qrPayload = `COTEMS|${existing.id_number}|${token}`

    const updatePayload = {
      qr_token: token,
      qr_payload: qrPayload,
      qr_status: 'active',
      name: vals.name || existing.name,
      home_campus_id: vals.homeCampus || existing.home_campus_id,
      mobile: vals.mobile || existing.mobile,
      purpose_of_visit: vals.purposeOfVisit || existing.purpose_of_visit,
      host_name: vals.hostName || existing.host_name,
      registered_by: registeredBy || 'Warden',
      registered_at: new Date().toISOString(),
      custom_fields: { ...(existing.custom_fields || {}), ...(vals.customFields || {}) }
    }

    const { data: updatedPerson, error: dbError } = await supabaseClient
      .from('people')
      .update(updatePayload)
      .eq('id', personId)
      .select()
      .single()

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({ person: updatedPerson }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
