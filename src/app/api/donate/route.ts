import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateReceiptNumber } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      donationType,
      campaignId,
      amount,
      studentCount,
      monthsCount,
      preferredStudentId,
      monthlyFee,
      donorName,
      donorEmail,
      donorPhone,
      message,
      isAnonymous,
      paymentMethod,
      userId,
    } = body

    if (!donationType || !amount || amount < 100 || !donorName || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const receipt = generateReceiptNumber()

    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .insert({
        donor_id: userId || null,
        donor_name: isAnonymous ? 'Anonymous' : donorName,
        donor_email: donorEmail || null,
        donor_phone: donorPhone || null,
        donation_type: donationType,
        campaign_id: campaignId || null,
        amount,
        currency: 'PKR',
        message: message || null,
        is_anonymous: isAnonymous ?? false,
        status: paymentMethod === 'card' ? 'completed' : 'pending',
        payment_method: paymentMethod,
        payment_ref: `MOCK-${Date.now()}`,
        receipt_number: receipt,
      })
      .select('id')
      .single()

    if (donationError) {
      return NextResponse.json({ error: 'Failed to record donation.' }, { status: 500 })
    }

    if (donationType === 'student_fee' && donation) {
      const { error: sponsorError } = await supabase.from('student_sponsorships').insert({
        donation_id: donation.id,
        preferred_student_id: preferredStudentId || null,
        months_count: monthsCount ?? 1,
        monthly_amount: monthlyFee ?? 2000,
        total_amount: amount,
        academic_year: new Date().getFullYear().toString(),
      })

      if (sponsorError) {
        // Donation succeeded — log but don't fail the whole request
        console.error('Sponsorship insert failed:', sponsorError)
      }
    }

    return NextResponse.json({ receiptNumber: receipt, donationId: donation.id })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
