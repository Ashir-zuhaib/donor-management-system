import { NextRequest, NextResponse } from 'next/server'
import { assertAdmin } from '@/lib/api-helpers'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const authError = await assertAdmin()
  if (authError) return authError

  const { sponsorshipId, studentId } = await request.json()
  if (!sponsorshipId || !studentId) return NextResponse.json({ error: 'Missing fields.' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('student_sponsorships')
    .update({ allocated_student_id: studentId })
    .eq('id', sponsorshipId)

  if (error) return NextResponse.json({ error: 'Update failed.' }, { status: 500 })

  return NextResponse.json({ success: true })
}
