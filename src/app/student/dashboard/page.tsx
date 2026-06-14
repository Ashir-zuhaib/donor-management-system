import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPKR, formatDate, getStatusColor } from '@/lib/utils'
import { BookOpen, CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import StudentLogoutButton from './StudentLogoutButton'
import type { FeePayment } from '@/lib/types'

export const revalidate = 0

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default async function StudentDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/student/login')

  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md text-center p-8">
          <AlertCircle className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">No Student Record Linked</h2>
          <p className="text-gray-500 text-sm mb-4">Your account is not linked to a student record. Please contact the Madarsa administration.</p>
          <StudentLogoutButton />
        </Card>
      </div>
    )
  }

  const { data: payments } = await supabase
    .from('fee_payments')
    .select('*')
    .eq('student_id', student.id)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const paidMonths = new Set((payments ?? []).filter((p: FeePayment) => p.status === 'completed').map((p: FeePayment) => `${p.year}-${p.month}`))
  const pendingMonths = new Set((payments ?? []).filter((p: FeePayment) => p.status === 'pending').map((p: FeePayment) => `${p.year}-${p.month}`))

  const totalPaid = (payments ?? []).filter((p: FeePayment) => p.status === 'completed').reduce((s: number, p: FeePayment) => s + p.amount, 0)

  // Determine overdue months (past months that are not paid)
  const overdueMonths: { month: number; year: number }[] = []
  for (let m = 1; m < currentMonth; m++) {
    const key = `${currentYear}-${m}`
    if (!paidMonths.has(key) && !pendingMonths.has(key)) {
      overdueMonths.push({ month: m, year: currentYear })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">{student.name}</p>
              <p className="text-xs text-gray-400">{student.student_code} · Class {student.class_level || '—'}</p>
            </div>
          </div>
          <StudentLogoutButton />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card><CardContent className="p-3 text-center">
            <p className="text-base sm:text-xl font-bold text-blue-600 truncate">{formatPKR(student.monthly_fee)}</p>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Monthly Fee</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-base sm:text-xl font-bold text-emerald-600 truncate">{formatPKR(totalPaid)}</p>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Total Paid</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-base sm:text-xl font-bold text-red-500">{overdueMonths.length}</p>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Overdue</p>
          </CardContent></Card>
        </div>

        {/* Overdue alert */}
        {overdueMonths.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="font-semibold text-red-800">You have {overdueMonths.length} overdue month(s)</p>
            </div>
            <p className="text-sm text-red-600 mb-3">
              {overdueMonths.map(m => `${MONTHS[m.month - 1]} ${m.year}`).join(', ')}
            </p>
            <Link href="/student/pay">
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">Pay Now</Button>
            </Link>
          </div>
        )}

        {/* Current month status */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base">{MONTHS[currentMonth - 1]} {currentYear}</CardTitle>
              {paidMonths.has(`${currentYear}-${currentMonth}`) ? (
                <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>
              ) : pendingMonths.has(`${currentYear}-${currentMonth}`) ? (
                <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-600">Not Paid</Badge>
              )}
            </div>
          </CardHeader>
          {!paidMonths.has(`${currentYear}-${currentMonth}`) && !pendingMonths.has(`${currentYear}-${currentMonth}`) && (
            <CardContent>
              <Link href={`/student/pay?month=${currentMonth}&year=${currentYear}`}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <CreditCard className="w-4 h-4 mr-2" />Pay {MONTHS[currentMonth - 1]} Fee — {formatPKR(student.monthly_fee)}
                </Button>
              </Link>
            </CardContent>
          )}
        </Card>

        {/* Year Overview Grid */}
        <Card>
          <CardHeader><CardTitle className="text-base">{currentYear} — Monthly Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                const key = `${currentYear}-${m}`
                const isPaid = paidMonths.has(key)
                const isPending = pendingMonths.has(key)
                const isFuture = m > currentMonth
                return (
                  <div
                    key={m}
                    className={`rounded-lg p-2 text-center text-xs font-medium border transition-colors ${
                      isPaid ? 'bg-emerald-100 border-emerald-300 text-emerald-700' :
                      isPending ? 'bg-yellow-100 border-yellow-300 text-yellow-700' :
                      isFuture ? 'bg-gray-50 border-gray-200 text-gray-400' :
                      'bg-red-50 border-red-200 text-red-600'
                    }`}
                  >
                    <p>{MONTHS[m - 1]}</p>
                    <p className="text-[10px] mt-0.5">{isPaid ? '✓ Paid' : isPending ? '⏳ Pending' : isFuture ? '—' : '✗ Due'}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        {(payments ?? []).length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Payment History</CardTitle></CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm min-w-[360px]">
                <thead className="bg-gray-50 border-y">
                  <tr>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium">Month</th>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium">Amount</th>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium hidden sm:table-cell">Method</th>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium">Status</th>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(payments ?? []).map((p: FeePayment) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{MONTHS[p.month - 1].slice(0, 3)} {p.year}</td>
                      <td className="px-4 py-3 font-semibold text-blue-600 whitespace-nowrap">{formatPKR(p.amount)}</td>
                      <td className="px-4 py-3 capitalize text-gray-500 hidden sm:table-cell">{p.payment_method || '—'}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(p.status)}`}>{p.status}</span></td>
                      <td className="px-4 py-3 text-gray-400 hidden sm:table-cell whitespace-nowrap">{formatDate(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
