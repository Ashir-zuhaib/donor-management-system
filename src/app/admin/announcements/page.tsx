import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Plus } from 'lucide-react'
import PublishToggle from './PublishToggle'
import type { Announcement } from '@/lib/types'

export const revalidate = 0

export default async function AnnouncementsPage() {
  const supabase = await createClient()
  const { data: announcements } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-gray-500 text-sm mt-1">Publish notices for donors on the public site</p>
        </div>
        <Link href="/admin/announcements/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" />New Announcement</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {(announcements ?? []).map((ann: Announcement) => (
          <Card key={ann.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="capitalize text-xs">{ann.entity_type}</Badge>
                    {ann.is_published ? (
                      <Badge className="bg-green-100 text-green-800 text-xs">Published</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 text-xs">Draft</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold">{ann.title}</h3>
                  {ann.content && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ann.content}</p>}
                  <p className="text-xs text-gray-400 mt-2">{formatDate(ann.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <PublishToggle id={ann.id} isPublished={ann.is_published} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!announcements || announcements.length === 0) && (
          <div className="text-center py-16 text-gray-400">
            <p className="mb-3">No announcements yet.</p>
            <Link href="/admin/announcements/new">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Create First Announcement</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
