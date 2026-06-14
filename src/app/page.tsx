import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPKR } from '@/lib/utils'
import { Heart, BookOpen, Users, ArrowRight, Megaphone } from 'lucide-react'
import Navbar from '@/components/Navbar'
import type { Campaign, Announcement } from '@/lib/types'

export const revalidate = 60

async function getData() {
  try {
    const supabase = await createClient()
    const [{ data: campaigns }, { data: announcements }, { data: stats }] = await Promise.all([
      supabase.from('campaigns').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(4),
      supabase.from('announcements').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(3),
      supabase.from('fund_summary').select('*').single(),
    ])
    return { campaigns: (campaigns ?? []) as Campaign[], announcements: (announcements ?? []) as Announcement[], stats }
  } catch {
    return { campaigns: [], announcements: [], stats: null }
  }
}

export default async function HomePage() {
  const { campaigns, announcements, stats } = await getData()

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1 text-sm mb-6">
            <Heart className="w-4 h-4" />
            <span>Sadaqah Jariyah — Continuous Charity</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Support Your Masjid & Madarsa
          </h1>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            Every rupee you donate builds our community. Fund the Masjid, support Madarsa campaigns,
            and sponsor the education of students who need it most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/donate">
              <Button size="lg" className="bg-white text-emerald-800 hover:bg-emerald-50 font-semibold px-8">
                Donate Now
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white/10 px-8">
                View Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-emerald-700">{formatPKR(stats?.masjid_total ?? 0)}</p>
            <p className="text-sm text-gray-500 mt-1">Masjid Collected</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-700">{formatPKR(stats?.madarsa_student_total ?? 0)}</p>
            <p className="text-sm text-gray-500 mt-1">Madarsa Collected</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-700">{stats?.completed_count ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">Total Donations</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-700">{campaigns.length}</p>
            <p className="text-sm text-gray-500 mt-1">Active Campaigns</p>
          </div>
        </div>
      </section>

      {/* Donation Options */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">How Would You Like to Give?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Heart, title: 'Masjid Fund', desc: 'Support Masjid operations, maintenance, and special campaigns like solar panels and AC.', href: '/donate?type=masjid_general', label: 'Donate to Masjid' },
              { icon: BookOpen, title: 'Madarsa Fund', desc: 'Support Madarsa education and facilities, and help keep the lights of knowledge shining.', href: '/donate?type=madarsa_general', label: 'Donate to Madarsa' },
              { icon: Users, title: 'Sponsor a Student', desc: 'Pay 1 month or a full year of fees for deserving students who study on scholarship.', href: '/donate?type=student_fee', label: 'Sponsor Student' },
            ].map(({ icon: Icon, title, desc, href, label }) => (
              <Card key={title} className="border-2 hover:border-emerald-500 transition-colors group">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-600 transition-colors">
                    <Icon className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{desc}</p>
                  <Link href={href}>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">{label}</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Active Campaigns */}
      {campaigns.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Active Campaigns</h2>
              <Link href="/campaigns" className="text-emerald-600 flex items-center gap-1 text-sm hover:underline">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-8">
              <Megaphone className="w-5 h-5 text-emerald-600" />
              <h2 className="text-2xl font-bold">Announcements</h2>
            </div>
            <div className="space-y-4">
              {announcements.map((ann) => (
                <Card key={ann.id}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="capitalize text-xs">{ann.entity_type}</Badge>
                      <h3 className="font-semibold">{ann.title}</h3>
                    </div>
                    {ann.content && <p className="text-gray-500 text-sm line-clamp-2">{ann.content}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-10 px-4 mt-auto">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white">Suleimaniyyah Masjid & Madarsa</span>
          </div>
          <p className="text-sm text-gray-400">All donations are used for the betterment of the community. May Allah accept your sadaqah.</p>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <Link href="/donate" className="hover:text-white">Donate</Link>
            <Link href="/campaigns" className="hover:text-white">Campaigns</Link>
            <Link href="/login" className="hover:text-white">Login</Link>
          </div>
        </div>
      </footer>
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
        <div className="h-40 bg-gray-100 overflow-hidden">
          <img src={campaign.image_url} alt={campaign.title} className="w-full h-full object-cover" />
        </div>
      )}
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="capitalize text-xs">{campaign.entity_type}</Badge>
          <span className="text-xs text-gray-400">{campaign.end_date ? `Ends ${new Date(campaign.end_date).toLocaleDateString('en-PK')}` : 'Ongoing'}</span>
        </div>
        <h3 className="font-bold text-base mb-1">{campaign.title}</h3>
        {campaign.description && <p className="text-gray-500 text-sm mb-3 line-clamp-2">{campaign.description}</p>}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-emerald-600">{formatPKR(campaign.collected_amount)}</span>
            {campaign.target_amount && <span className="text-gray-400">of {formatPKR(campaign.target_amount)}</span>}
          </div>
          {progress !== null && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
        <Link href={`/campaigns/${campaign.id}`} className="block mt-4">
          <Button variant="outline" size="sm" className="w-full">View Campaign</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
