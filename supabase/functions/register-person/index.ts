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
    const { name, idNumber, role, homeCampus, mobile, registeredBy, college, department, designation, employmentType, yearOfEnrolment, purposeOfVisit, hostName, customFields } = body

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let password = ''
    for (let i = 0; i < 8; i++) password += chars[Math.floor(Math.random() * chars.length)]

    const cleanId = (idNumber || '').trim()
    let safeEmailUser = cleanId
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9._-]/g, '')
      .replace(/^[._-]+|[._-]+$/g, '')
    if (!safeEmailUser) safeEmailUser = 'person-' + Math.floor(100000 + Math.random() * 900000)

    const email = `${safeEmailUser}@person.cotems.local`

    // Create or reuse auth user
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'person', idNumber: cleanId, personRole: role }
    })

    let authUserId = authUser?.user?.id

    if (authError) {
      if (authError.message && authError.message.includes("already been registered")) {
        const { data: users } = await supabaseClient.auth.admin.listUsers()
        const found = users?.users?.find((u: { email?: string; id: string }) => u.email === email)
        if (found) {
          authUserId = found.id
          await supabaseClient.auth.admin.updateUserById(authUserId, {
            password,
            user_metadata: { role: 'person', idNumber: cleanId, personRole: role }
          })
        } else {
          throw authError
        }
      } else {
        throw authError
      }
    }

    const tokenChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let token = ''
    for (let i = 0; i < 10; i++) token += tokenChars[Math.floor(Math.random() * tokenChars.length)]

    const qrPayload = `COTEMS|${cleanId}|${token}`

    // Check if person already exists by id_number
    const { data: existingPerson } = await supabaseClient
      .from('people')
      .select('id')
      .eq('id_number', cleanId)
      .maybeSingle()

    let resultPerson = null

    if (existingPerson) {
      const { data: updatedPerson, error: dbError } = await supabaseClient
        .from('people')
        .update({
          qr_token: token,
          qr_payload: qrPayload,
          name,
          role,
          home_campus_id: homeCampus,
          college: college || '',
          department: department || '',
          designation: designation || '',
          employment_type: employmentType || '',
          year_of_enrolment: yearOfEnrolment || '',
          purpose_of_visit: purposeOfVisit || '',
          host_name: hostName || '',
          mobile: mobile || '',
          qr_status: 'active',
          registered_by: registeredBy || 'System',
          registered_at: new Date().toISOString(),
          custom_fields: customFields || {},
          auth_user_id: authUserId
        })
        .eq('id', existingPerson.id)
        .select()
        .single()

      if (dbError) throw dbError
      resultPerson = updatedPerson
    } else {
      const personId = 'P' + Math.floor(100000 + Math.random() * 900000)
      const personRow = {
        id: personId,
        id_number: cleanId,
        qr_token: token,
        qr_payload: qrPayload,
        name,
        role,
        home_campus_id: homeCampus,
        college: college || '',
        department: department || '',
        designation: designation || '',
        employment_type: employmentType || '',
        year_of_enrolment: yearOfEnrolment || '',
        purpose_of_visit: purposeOfVisit || '',
        host_name: hostName || '',
        mobile: mobile || '',
        qr_status: 'active',
        registered_by: registeredBy || 'System',
        registered_at: new Date().toISOString(),
        custom_fields: customFields || {},
        auth_user_id: authUserId
      }

      const { data: insertedPerson, error: dbError } = await supabaseClient
        .from('people')
        .insert(personRow)
        .select()
        .single()

      if (dbError) throw dbError
      resultPerson = insertedPerson
    }

    return new Response(
      JSON.stringify({ person: resultPerson, password }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
