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

    const username = 'sysadmin'
    const password = 'FnuAdmin#2026'
    const email = `${username}@admin.cotems.local`

    // Check if sysadmin row already exists
    const { data: existingAdmin } = await supabaseClient
      .from('sysadmins')
      .select('*')
      .eq('username', username)
      .maybeSingle()

    if (existingAdmin && existingAdmin.auth_user_id) {
      return new Response(
        JSON.stringify({ message: "Default sysadmin already exists", sysadmin: existingAdmin }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Create auth user
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'sysadmin', username }
    })

    if (authError && !authError.message.includes("already been registered")) {
      throw authError
    }

    let authUserId = authUser?.user?.id
    if (!authUserId) {
      // User exists in auth, get ID
      const { data: users } = await supabaseClient.auth.admin.listUsers()
      const found = users.users.find(u => u.email === email)
      if (found) authUserId = found.id
    }

    // Upsert sysadmin row
    const sysadminRow = {
      id: 'ADM1',
      username,
      name: 'System Administrator',
      registered_at: new Date().toISOString(),
      auth_user_id: authUserId
    }

    const { data: insertedAdmin, error: dbError } = await supabaseClient
      .from('sysadmins')
      .upsert(sysadminRow)
      .select()
      .single()

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({ message: "Sysadmin created successfully", sysadmin: insertedAdmin }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
