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
    const { campusId, buildingId, roomId, username, password: providedPassword, registeredBy } = body

    if (!username || !username.trim()) {
      throw new Error("Scanner username is required")
    }

    const cleanUsername = username.trim()

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let password = providedPassword || ''
    if (!password) {
      for (let i = 0; i < 8; i++) password += chars[Math.floor(Math.random() * chars.length)]
    }

    // Sanitize username into a valid email local-part (lowercase alphanumeric, dot, hyphen, underscore)
    let safeEmailUser = cleanUsername
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9._-]/g, '')
      .replace(/^[._-]+|[._-]+$/g, '')
    if (!safeEmailUser) safeEmailUser = 'scanner-' + Math.floor(1000 + Math.random() * 9000)

    const email = `${safeEmailUser}@scanner.cotems.local`

    // Create or reuse auth user
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'scanner', username: cleanUsername, campusId }
    })

    let authUserId = authUser?.user?.id

    if (authError) {
      if (authError.message && authError.message.includes("already been registered")) {
        const { data: users } = await supabaseClient.auth.admin.listUsers()
        const found = users?.users?.find((u: { email?: string; id: string }) => u.email === email)
        if (found) {
          authUserId = found.id
          await supabaseClient.auth.admin.updateUserById(authUserId, { password })
        } else {
          throw authError
        }
      } else {
        throw authError
      }
    }

    const scannerId = 'SCN' + Math.floor(1000 + Math.random() * 9000)

    const scannerRow = {
      id: scannerId,
      campus_id: campusId,
      building_id: buildingId || null,
      room_id: roomId || null,
      username: cleanUsername,
      active: true,
      registered_by: registeredBy || 'Admin',
      registered_at: new Date().toISOString(),
      auth_user_id: authUserId
    }

    const { data: insertedScanner, error: dbError } = await supabaseClient
      .from('scanners')
      .insert(scannerRow)
      .select()
      .single()

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({ scanner: insertedScanner, password }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
