import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateReceiptNumber } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { studentId, months, paymentMethod } = await request.json()

    if (!studentId || !months?.length || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify the student belongs to this user
    const { data: student } = await supabase
      .from('students')
      .select('id, monthly_fee, profile_id')
      .eq('id', studentId)
      .eq('profile_id', user.id)
      .maybeSingle()

    if (!student) {
      return NextResponse.json({ error: 'Student not found or not linked to your account.' }, { status: 403 })
    }

    const receipts: string[] = []

    for (const { month, year } of months) {
      const receipt = generateReceiptNumber()
      receipts.push(receipt)

      const { error } = await supabase.from('fee_payments').insert({
        student_id: student.id,
        profile_id: user.id,
        month,
        year,
        amount: student.monthly_fee,
        payment_method: paymentMethod,
        payment_ref: `MOCK-${Date.now()}`,
        status: paymentMethod === 'card' ? 'completed' : 'pending',
        receipt_number: receipt,
      })

      if (error) {
        // Ignore duplicate month/year (already paid), continue
        if (error.code !== '23505') {
          return NextResponse.json({ error: 'Failed to record payment.' }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ receipts })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
