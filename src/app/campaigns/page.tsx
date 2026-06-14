import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatPKR } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import type { Campaign } from '@/lib/types'

export const revalidate = 60

async function getCampaigns() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('campaigns').select('*').eq('status', 'active').order('created_at', { ascending: false })
    return (data ?? []) as Campaign[]
  } catch {
    return []
  }
}

export default async function CampaignsPage() {
  const campaigns = await getCampaigns()
  const masjidCampaigns = campaigns.filter((c) => c.entity_type === 'masjid')
  const madarsaCampaigns = campaigns.filter((c) => c.entity_type === 'madarsa')

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto w-full px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Active Campaigns</h1>
          <p className="text-gray-500 mt-2">Support specific causes running in our Masjid and Madarsa.</p>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({campaigns.length})</TabsTrigger>
            <TabsTrigger value="masjid">Masjid ({masjidCampaigns.length})</TabsTrigger>
            <TabsTrigger value="madarsa">Madarsa ({madarsaCampaigns.length})</TabsTrigger>
          </TabsList>

          {['all', 'masjid', 'madarsa'].map((tab) => {
            const list = tab === 'all' ? campaigns : tab === 'masjid' ? masjidCampaigns : madarsaCampaigns
            return (
              <TabsContent key={tab} value={tab}>
                {list.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">No active campaigns at the moment.</div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {list.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}
                  </div>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </div>
  )
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const progress = campaign.target_amount
    ? Math.min(100, Math.round((campaign.collected_amount / campaign.target_amount) * 100))
    : null

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {campaign.image_url && (
        <div className="h-44 bg-gray-100 overflow-hidden">
          <img src={campaign.image_url} alt={campaign.title} className="w-full h-full object-cover" />
        </div>
      )}
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="capitalize text-xs">{campaign.entity_type}</Badge>
          {campaign.end_date && (
            <span className="text-xs text-gray-400">Ends {new Date(campaign.end_date).toLocaleDateString('en-PK')}</span>
          )}
        </div>
        <h3 className="font-bold text-lg mb-2">{campaign.title}</h3>
        {campaign.description && <p className="text-gray-500 text-sm mb-4 line-clamp-3">{campaign.description}</p>}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-emerald-600">{formatPKR(campaign.collected_amount)} raised</span>
            {campaign.target_amount && <span className="text-gray-400">Goal: {formatPKR(campaign.target_amount)}</span>}
          </div>
          {progress !== null && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-gray-400 text-right">{progress}% funded</p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/campaigns/${campaign.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">Details</Button>
          </Link>
          <Link href={`/donate?campaign=${campaign.id}&type=${campaign.entity_type}_campaign`} className="flex-1">
            <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">Donate</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
