import { NextRequest, NextResponse } from 'next/server'
import { assertAdmin } from '@/lib/api-helpers'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const authError = await assertAdmin()
  if (authError) return authError

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase.from('donations').update({ status: 'completed' }).eq('id', id)
  if (error) return NextResponse.json({ error: 'Update failed.' }, { status: 500 })

  return NextResponse.json({ success: true })
}
