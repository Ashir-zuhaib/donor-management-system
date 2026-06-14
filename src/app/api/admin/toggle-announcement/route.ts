import { NextRequest, NextResponse } from 'next/server'
import { assertAdmin } from '@/lib/api-helpers'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const authError = await assertAdmin()
  if (authError) return authError

  const { id, publish } = await request.json()
  if (!id || publish === undefined) return NextResponse.json({ error: 'Missing fields.' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('announcements')
    .update({ is_published: publish, published_at: publish ? new Date().toISOString() : null })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Update failed.' }, { status: 500 })

  return NextResponse.json({ success: true })
}
