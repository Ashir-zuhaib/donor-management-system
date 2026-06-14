import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPKR, formatDate, getDonationTypeLabel, getStatusColor } from '@/lib/utils'
import { Heart, BookOpen, Users, Clock, TrendingUp, HandCoins } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 30

async function getDashboardData() {
  const supabase = await createClient()

  const [
    { data: stats },
    { data: recentDonations },
    { data: campaignCount },
    { data: studentCounts },
    { data: unallocated },
  ] = await Promise.all([
    supabase.from('fund_summary').select('*').single(),
    supabase.from('donations').select('*, campaign:campaigns(title)').order('created_at', { ascending: false }).limit(8),
    supabase.from('campaigns').select('id', { count: 'exact' }).eq('status', 'active'),
    supabase.from('students').select('id, fee_type', { count: 'exact' }).eq('status', 'active'),
    supabase.from('student_sponsorships').select('id', { count: 'exact' }).is('allocated_student_id', null),
  ])

  const sponsoredStudents = (studentCounts ?? []).filter((s) => s.fee_type === 'sponsored').length
  const totalStudents = (studentCounts ?? []).length

  return {
    stats,
    recentDonations: recentDonations ?? [],
    activeCampaigns: campaignCount?.length ?? 0,
    totalStudents,
    sponsoredStudents,
    unallocatedSponsorships: unallocated?.length ?? 0,
  }
}

export default async function AdminDashboard() {
  const { stats, recentDonations, activeCampaigns, totalStudents, sponsoredStudents, unallocatedSponsorships } = await getDashboardData()

  const statCards = [
    { title: 'Masjid Fund', value: formatPKR(stats?.masjid_total ?? 0), icon: Heart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Madarsa Fund', value: formatPKR(stats?.madarsa_student_total ?? 0), icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Pending Donations', value: stats?.pending_count ?? 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: 'Total Donations', value: stats?.completed_count ?? 0, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Active Campaigns', value: activeCampaigns, icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50' },
    { title: 'Sponsored Students', value: `${sponsoredStudents} / ${totalStudents}`, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of donations and community funds</p>
      </div>

      {unallocatedSponsorships > 0 && (
        <Link href="/admin/sponsorships">
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-center gap-3 hover:bg-amber-100 transition-colors">
            <HandCoins className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-800">{unallocatedSponsorships} student sponsorship(s) need allocation</p>
              <p className="text-xs text-amber-600">Click to assign funds to specific students</p>
            </div>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {statCards.map(({ title, value, icon: Icon, color, bg }) => (
          <Card key={title}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">{title}</p>
                  <p className="text-lg sm:text-xl font-bold truncate">{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Recent Donations</CardTitle>
          <Link href="/admin/transactions" className="text-sm text-emerald-600 hover:underline">View all</Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-y">
                <tr>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Donor</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium hidden sm:table-cell">Type</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Amount</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentDonations.map((d: any) => (
                  <tr key={d.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{d.is_anonymous ? 'Anonymous' : (d.donor_name || '—')}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{getDonationTypeLabel(d.donation_type)}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 whitespace-nowrap">{formatPKR(d.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(d.status)}`}>{d.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell whitespace-nowrap">{formatDate(d.created_at)}</td>
                  </tr>
                ))}
                {recentDonations.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No donations yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
