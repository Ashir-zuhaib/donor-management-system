import { NextRequest, NextResponse } from 'next/server'
import { assertAdmin } from '@/lib/api-helpers'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const authError = await assertAdmin()
  if (authError) return authError

  const body = await request.json()
  const { name, student_code, age, class_level, monthly_fee, fee_type, guardian_name, guardian_contact, enrollment_date, notes } = body

  if (!name || !monthly_fee) return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase.from('students').insert({
    name,
    student_code: student_code ? student_code.toUpperCase() : null,
    age: age ? Number(age) : null,
    class_level: class_level || null,
    monthly_fee: Number(monthly_fee),
    fee_type,
    guardian_name: guardian_name || null,
    guardian_contact: guardian_contact || null,
    enrollment_date: enrollment_date || null,
    notes: notes || null,
    status: 'active',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
