import { NextRequest, NextResponse } from 'next/server'
import { assertAdmin } from '@/lib/api-helpers'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const authError = await assertAdmin()
  if (authError) return authError

  const body = await request.json()
  const { title, description, entity_type, target_amount, start_date, end_date, is_featured } = body

  if (!title || !entity_type) return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase.from('campaigns').insert({
    title,
    description: description || null,
    entity_type,
    target_amount: target_amount ? Number(target_amount) : null,
    start_date: start_date || null,
    end_date: end_date || null,
    is_featured: is_featured ?? false,
    status: 'active',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
