import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { studentId, profileId, fullName } = await request.json()

    if (!studentId || !profileId) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Ensure the student is still unlinked (race-condition guard)
    const { data: student } = await supabase
      .from('students')
      .select('profile_id, fee_type, status')
      .eq('id', studentId)
      .maybeSingle()

    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 })
    }

    if (student.profile_id) {
      return NextResponse.json({ error: 'Student ID already linked to another account.' }, { status: 409 })
    }

    // Create/upsert profile row
    await supabase.from('profiles').upsert({
      id: profileId,
      full_name: fullName,
      role: 'donor',
    })

    // Link student → profile
    const { error: linkError } = await supabase
      .from('students')
      .update({ profile_id: profileId })
      .eq('id', studentId)

    if (linkError) {
      return NextResponse.json({ error: 'Failed to link account.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
