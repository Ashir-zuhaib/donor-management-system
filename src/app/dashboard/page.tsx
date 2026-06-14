import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPKR, formatDate, getDonationTypeLabel, getStatusColor } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import { Heart, LogOut } from 'lucide-react'
import LogoutButton from './LogoutButton'

export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { data: donations }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('donations').select('*, campaign:campaigns(title)').eq('donor_id', user.id).order('created_at', { ascending: false }).limit(20),
  ])

  const completed = (donations ?? []).filter((d: any) => d.status === 'completed')
  const totalGiven = completed.reduce((s: number, d: any) => s + d.amount, 0)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar userRole={profile?.role} />
      <div className="max-w-4xl mx-auto w-full px-4 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Donations</h1>
            <p className="text-gray-500 text-sm mt-1">Assalamu Alaikum, {profile?.full_name || user.email}</p>
          </div>
          <LogoutButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold text-emerald-600">{formatPKR(totalGiven)}</p><p className="text-xs text-gray-500 mt-1">Total Donated</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold text-blue-600">{completed.length}</p><p className="text-xs text-gray-500 mt-1">Completed</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold text-yellow-600">{(donations ?? []).length - completed.length}</p><p className="text-xs text-gray-500 mt-1">Pending</p></CardContent></Card>
        </div>

        {/* CTA */}
        <div className="flex gap-3">
          <Link href="/donate">
            <Button className="bg-emerald-600 hover:bg-emerald-700"><Heart className="w-4 h-4 mr-2" />Donate Again</Button>
          </Link>
          <Link href="/campaigns">
            <Button variant="outline">Browse Campaigns</Button>
          </Link>
        </div>

        {/* Donation History */}
        <Card>
          <CardHeader><CardTitle className="text-base">Donation History</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-y">
                  <tr>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium">Receipt</th>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium">Type</th>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium">Amount</th>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium">Status</th>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(donations ?? []).map((d: any) => (
                    <tr key={d.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{d.receipt_number || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{getDonationTypeLabel(d.donation_type)}{d.campaign?.title && <span className="block text-xs text-gray-400">{d.campaign.title}</span>}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">{formatPKR(d.amount)}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(d.status)}`}>{d.status}</span></td>
                      <td className="px-4 py-3 text-gray-400">{formatDate(d.created_at)}</td>
                    </tr>
                  ))}
                  {(!donations || donations.length === 0) && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">You haven&apos;t donated yet. <Link href="/donate" className="text-emerald-600 hover:underline">Donate now</Link></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
