import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { studentCode } = await request.json()

    if (!studentCode || typeof studentCode !== 'string') {
      return NextResponse.json({ error: 'Student ID is required.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: student, error } = await supabase
      .from('students')
      .select('id, name, class_level, monthly_fee, fee_type, profile_id, status')
      .ilike('student_code', studentCode.trim())  // case-insensitive match
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: 'Lookup failed. Try again.' }, { status: 500 })
    }

    if (!student) {
      return NextResponse.json({ error: 'Student ID not found. Check with the Madarsa administration.' }, { status: 404 })
    }

    if (student.status !== 'active') {
      return NextResponse.json({ error: 'This student record is not active.' }, { status: 400 })
    }

    if (student.fee_type !== 'self_paying') {
      return NextResponse.json({ error: 'This student is on a scholarship. Only self-paying students can register here.' }, { status: 400 })
    }

    if (student.profile_id) {
      return NextResponse.json({ error: 'This Student ID already has an account. Please sign in instead.' }, { status: 409 })
    }

    // Return only what the frontend needs — no internal IDs exposed
    return NextResponse.json({
      studentId: student.id,
      name: student.name,
      classLevel: student.class_level,
      monthlyFee: student.monthly_fee,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
