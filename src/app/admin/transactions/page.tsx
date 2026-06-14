import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPKR, formatDate, getDonationTypeLabel, getStatusColor } from '@/lib/utils'
import ConfirmDonationButton from './ConfirmDonationButton'

export const revalidate = 0

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: donations } = await supabase
    .from('donations')
    .select('*, campaign:campaigns(title)')
    .order('created_at', { ascending: false })
    .limit(100)

  const pending = (donations ?? []).filter((d: any) => d.status === 'pending')
  const completed = (donations ?? []).filter((d: any) => d.status === 'completed')
  const totalCollected = completed.reduce((s: number, d: any) => s + d.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-gray-500 text-sm mt-1">All donations and payment records</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-base sm:text-xl font-bold text-emerald-600 truncate">{formatPKR(totalCollected)}</p><p className="text-[11px] sm:text-xs text-gray-500 mt-1">Collected</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-base sm:text-xl font-bold text-yellow-600">{pending.length}</p><p className="text-[11px] sm:text-xs text-gray-500 mt-1">Pending</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-base sm:text-xl font-bold text-gray-800">{(donations ?? []).length}</p><p className="text-[11px] sm:text-xs text-gray-500 mt-1">Total</p></CardContent></Card>
      </div>

      {pending.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3"><CardTitle className="text-base text-yellow-800">Pending Confirmation ({pending.length})</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[420px]">
              <thead className="border-b border-yellow-200">
                <tr>
                  <th className="text-left px-4 py-2 text-yellow-700 font-medium">Donor</th>
                  <th className="text-left px-4 py-2 text-yellow-700 font-medium">Amount</th>
                  <th className="text-left px-4 py-2 text-yellow-700 font-medium hidden sm:table-cell">Method</th>
                  <th className="text-left px-4 py-2 text-yellow-700 font-medium hidden sm:table-cell">Date</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((d: any) => (
                  <tr key={d.id} className="border-b border-yellow-100">
                    <td className="px-4 py-3">
                      <p className="font-medium">{d.is_anonymous ? 'Anonymous' : (d.donor_name || '—')}</p>
                      <p className="text-xs text-gray-400">{d.donor_phone}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 whitespace-nowrap">{formatPKR(d.amount)}</td>
                    <td className="px-4 py-3 capitalize text-gray-500 hidden sm:table-cell">{d.payment_method || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell whitespace-nowrap">{formatDate(d.created_at)}</td>
                    <td className="px-4 py-3"><ConfirmDonationButton id={d.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">All Transactions</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-y">
                <tr>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium hidden sm:table-cell">Receipt</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Donor</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium hidden sm:table-cell">Type</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Amount</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium hidden sm:table-cell">Method</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {(donations ?? []).map((d: any) => (
                  <tr key={d.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400 hidden sm:table-cell">{d.receipt_number || '—'}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{d.is_anonymous ? 'Anonymous' : (d.donor_name || '—')}</p>
                      <p className="text-xs text-gray-400">{d.donor_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">{getDonationTypeLabel(d.donation_type)}{d.campaign?.title ? <span className="block text-gray-400">{d.campaign.title}</span> : null}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 whitespace-nowrap">{formatPKR(d.amount)}</td>
                    <td className="px-4 py-3 capitalize text-gray-500 hidden sm:table-cell">{d.payment_method || '—'}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(d.status)}`}>{d.status}</span></td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell whitespace-nowrap">{formatDate(d.created_at)}</td>
                  </tr>
                ))}
                {(!donations || donations.length === 0) && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No transactions yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
