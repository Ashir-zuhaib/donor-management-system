import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPKR, formatDate, getStatusColor } from '@/lib/utils'
import ConfirmFeeButton from './ConfirmFeeButton'

export const revalidate = 0

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default async function FeePaymentsPage() {
  const supabase = await createClient()
  const { data: payments } = await supabase
    .from('fee_payments')
    .select('*, student:students(name, student_code, class_level)')
    .order('created_at', { ascending: false })
    .limit(100)

  const pending = (payments ?? []).filter((p: any) => p.status === 'pending')
  const totalCollected = (payments ?? []).filter((p: any) => p.status === 'completed').reduce((s: number, p: any) => s + p.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Fee Payments</h1>
        <p className="text-gray-500 text-sm mt-1">Self-paying student fee records</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-base sm:text-xl font-bold text-blue-600 truncate">{formatPKR(totalCollected)}</p><p className="text-[11px] sm:text-xs text-gray-500 mt-1">Collected</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-base sm:text-xl font-bold text-yellow-600">{pending.length}</p><p className="text-[11px] sm:text-xs text-gray-500 mt-1">Pending</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-base sm:text-xl font-bold text-gray-800">{(payments ?? []).length}</p><p className="text-[11px] sm:text-xs text-gray-500 mt-1">Total</p></CardContent></Card>
      </div>

      {pending.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3"><CardTitle className="text-base text-yellow-800">Pending Confirmation ({pending.length})</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead className="border-b border-yellow-200">
                <tr>
                  <th className="text-left px-4 py-2 text-yellow-700 font-medium">Student</th>
                  <th className="text-left px-4 py-2 text-yellow-700 font-medium">Month</th>
                  <th className="text-left px-4 py-2 text-yellow-700 font-medium">Amount</th>
                  <th className="text-left px-4 py-2 text-yellow-700 font-medium hidden sm:table-cell">Method</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((p: any) => (
                  <tr key={p.id} className="border-b border-yellow-100">
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.student?.name}</p>
                      <p className="text-xs text-gray-400">{p.student?.student_code} · Class {p.student?.class_level || '—'}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{MONTHS[p.month - 1]} {p.year}</td>
                    <td className="px-4 py-3 font-semibold text-blue-600 whitespace-nowrap">{formatPKR(p.amount)}</td>
                    <td className="px-4 py-3 capitalize text-gray-500 hidden sm:table-cell">{p.payment_method || '—'}</td>
                    <td className="px-4 py-3"><ConfirmFeeButton id={p.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">All Fee Payments</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-y">
                <tr>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Student</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Month</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Amount</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium hidden sm:table-cell">Method</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {(payments ?? []).map((p: any) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.student?.name}</p>
                      <p className="text-xs text-gray-400">{p.student?.student_code}</p>
                    </td>
                    <td className="px-4 py-3">{MONTHS[p.month - 1]} {p.year}</td>
                    <td className="px-4 py-3 font-semibold text-blue-600">{formatPKR(p.amount)}</td>
                    <td className="px-4 py-3 capitalize text-gray-500 hidden sm:table-cell">{p.payment_method || '—'}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(p.status)}`}>{p.status}</span></td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell whitespace-nowrap">{formatDate(p.created_at)}</td>
                  </tr>
                ))}
                {(!payments || payments.length === 0) && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No fee payments yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
