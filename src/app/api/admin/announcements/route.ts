import { NextRequest, NextResponse } from 'next/server'
import { assertAdmin } from '@/lib/api-helpers'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const authError = await assertAdmin()
  if (authError) return authError

  const { title, content, entity_type, is_published } = await request.json()
  if (!title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase.from('announcements').insert({
    title,
    content: content || null,
    entity_type: entity_type || 'general',
    is_published: is_published ?? false,
    published_at: is_published ? new Date().toISOString() : null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
