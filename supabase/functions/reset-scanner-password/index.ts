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
    const { scannerId, newPassword: providedPassword } = body

    const { data: scanner, error: findError } = await supabaseClient
      .from('scanners')
      .select('*')
      .eq('id', scannerId)
      .single()

    if (findError || !scanner) throw new Error("Scanner not found")

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let newPassword = providedPassword || ''
    if (!newPassword) {
      for (let i = 0; i < 8; i++) newPassword += chars[Math.floor(Math.random() * chars.length)]
    }

    if (scanner.auth_user_id) {
      const { error: updateAuthErr } = await supabaseClient.auth.admin.updateUserById(
        scanner.auth_user_id,
        { password: newPassword }
      )
      if (updateAuthErr) throw updateAuthErr
    } else {
      const email = `${scanner.username}@scanner.cotems.local`
      const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
        email,
        password: newPassword,
        email_confirm: true,
        user_metadata: { role: 'scanner', username: scanner.username, campusId: scanner.campus_id }
      })
      if (authError) throw authError

      await supabaseClient.from('scanners').update({ auth_user_id: authUser.user.id }).eq('id', scanner.id)
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
