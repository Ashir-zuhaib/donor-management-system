import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPKR, formatDate } from '@/lib/utils'
import { ArrowLeft, Calendar, Target } from 'lucide-react'
import Navbar from '@/components/Navbar'

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: campaign } = await supabase.from('campaigns').select('*').eq('id', id).single()

  if (!campaign) notFound()

  const progress = campaign.target_amount
    ? Math.min(100, Math.round((campaign.collected_amount / campaign.target_amount) * 100))
    : null

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto w-full px-4 py-12">
        <Link href="/campaigns" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Campaigns
        </Link>

        {campaign.image_url && (
          <div className="w-full h-64 bg-gray-100 rounded-xl overflow-hidden mb-6">
            <img src={campaign.image_url} alt={campaign.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline" className="capitalize">{campaign.entity_type}</Badge>
          <Badge className={campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
            {campaign.status}
          </Badge>
        </div>

        <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
        {campaign.description && <p className="text-gray-600 leading-relaxed mb-6">{campaign.description}</p>}

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <p className="text-sm text-gray-500">Amount Raised</p>
                <p className="text-2xl font-bold text-emerald-600">{formatPKR(campaign.collected_amount)}</p>
              </div>
              {campaign.target_amount && (
                <div>
                  <p className="text-sm text-gray-500">Goal</p>
                  <p className="text-2xl font-bold">{formatPKR(campaign.target_amount)}</p>
                </div>
              )}
            </div>
            {progress !== null && (
              <div className="space-y-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-emerald-600 h-3 rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-sm text-gray-500 text-right">{progress}% of goal reached</p>
              </div>
            )}
            <div className="flex gap-4 mt-4 text-sm text-gray-500">
              {campaign.start_date && (
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Started {formatDate(campaign.start_date)}</span>
              )}
              {campaign.end_date && (
                <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Ends {formatDate(campaign.end_date)}</span>
              )}
            </div>
          </CardContent>
        </Card>

        {campaign.status === 'active' && (
          <Link href={`/donate?campaign=${campaign.id}&type=${campaign.entity_type}_campaign`}>
            <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              Donate to This Campaign
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
