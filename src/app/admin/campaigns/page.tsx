import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPKR, formatDate, getStatusColor } from '@/lib/utils'
import { Plus } from 'lucide-react'
import type { Campaign } from '@/lib/types'

export const revalidate = 30

export default async function AdminCampaignsPage() {
  const supabase = await createClient()
  const { data: campaigns } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-gray-500 text-sm mt-1">Manage Masjid and Madarsa fundraising campaigns</p>
        </div>
        <Link href="/admin/campaigns/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />New Campaign
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {(campaigns ?? []).map((campaign: Campaign) => {
          const progress = campaign.target_amount
            ? Math.min(100, Math.round((campaign.collected_amount / campaign.target_amount) * 100))
            : null
          return (
            <Card key={campaign.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="capitalize text-xs">{campaign.entity_type}</Badge>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(campaign.status)}`}>{campaign.status}</span>
                      {campaign.is_featured && <Badge className="bg-amber-100 text-amber-800 text-xs">Featured</Badge>}
                    </div>
                    <h3 className="font-semibold text-base">{campaign.title}</h3>
                    {campaign.description && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{campaign.description}</p>}
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="font-semibold text-emerald-600">{formatPKR(campaign.collected_amount)} raised</span>
                      {campaign.target_amount && <span className="text-gray-400">Goal: {formatPKR(campaign.target_amount)}</span>}
                      {campaign.end_date && <span className="text-gray-400">Ends {formatDate(campaign.end_date)}</span>}
                    </div>
                    {progress !== null && (
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                  <Link href={`/admin/campaigns/${campaign.id}`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {(!campaigns || campaigns.length === 0) && (
          <div className="text-center py-16 text-gray-400">
            <p className="mb-3">No campaigns yet.</p>
            <Link href="/admin/campaigns/new">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Create First Campaign</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
