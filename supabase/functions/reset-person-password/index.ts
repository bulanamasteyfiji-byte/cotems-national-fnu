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
    const { personId } = body

    const { data: person, error: findError } = await supabaseClient
      .from('people')
      .select('*')
      .eq('id', personId)
      .single()

    if (findError || !person) throw new Error("Person not found")

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let newPassword = ''
    for (let i = 0; i < 8; i++) newPassword += chars[Math.floor(Math.random() * chars.length)]

    if (person.auth_user_id) {
      const { error: updateAuthErr } = await supabaseClient.auth.admin.updateUserById(
        person.auth_user_id,
        { password: newPassword }
      )
      if (updateAuthErr) throw updateAuthErr
    } else {
      const email = `${person.id_number}@person.cotems.local`
      const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
        email,
        password: newPassword,
        email_confirm: true,
        user_metadata: { role: 'person', idNumber: person.id_number, personRole: person.role }
      })
      if (authError) throw authError

      await supabaseClient.from('people').update({ auth_user_id: authUser.user.id }).eq('id', person.id)
    }

    return new Response(
      JSON.stringify({ success: true, password: newPassword }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
