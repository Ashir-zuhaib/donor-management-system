import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPKR, formatDate } from '@/lib/utils'

export const revalidate = 30

export default async function DonorsPage() {
  const supabase = await createClient()

  const { data: donorStats } = await supabase
    .from('donations')
    .select('donor_name, donor_email, donor_phone, amount, status, created_at, is_anonymous')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  // Group by donor identifier
  const donorMap = new Map<string, { name: string; email: string; phone: string; totalAmount: number; donationCount: number; lastDonation: string }>()

  for (const d of (donorStats ?? [])) {
    if (d.is_anonymous) continue
    const key = d.donor_email || d.donor_phone || d.donor_name || 'unknown'
    const existing = donorMap.get(key)
    if (existing) {
      existing.totalAmount += d.amount
      existing.donationCount += 1
      if (d.created_at > existing.lastDonation) existing.lastDonation = d.created_at
    } else {
      donorMap.set(key, { name: d.donor_name || '—', email: d.donor_email || '—', phone: d.donor_phone || '—', totalAmount: d.amount, donationCount: 1, lastDonation: d.created_at })
    }
  }

  const donors = Array.from(donorMap.values()).sort((a, b) => b.totalAmount - a.totalAmount)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Donors</h1>
        <p className="text-gray-500 text-sm mt-1">{donors.length} unique donors (excluding anonymous)</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-y">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Total Given</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Donations</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Last Donation</th>
                </tr>
              </thead>
              <tbody>
                {donors.map((donor, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-sm font-bold text-emerald-700">{donor.name[0]?.toUpperCase()}</div>
                        <span className="font-medium">{donor.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-gray-600">{donor.phone}</p>
                      {donor.email !== '—' && <p className="text-xs text-gray-400">{donor.email}</p>}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600 whitespace-nowrap">{formatPKR(donor.totalAmount)}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{donor.donationCount}</td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell whitespace-nowrap">{formatDate(donor.lastDonation)}</td>
                  </tr>
                ))}
                {donors.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No donor data yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
