'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Loader2, Smartphone, CreditCard, ChevronLeft, BookOpen } from 'lucide-react'
import { formatPKR } from '@/lib/utils'
import type { PaymentMethod } from '@/lib/types'
import Link from 'next/link'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

type StudentInfo = {
  id: string
  name: string
  monthly_fee: number
  class_level: string | null
}

export default function StudentPayForm({ student, paidKeys }: { student: StudentInfo; paidKeys: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const existingPayments = new Set(paidKeys)

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('')
  const [selectedMonths, setSelectedMonths] = useState<{ month: number; year: number }[]>([])
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    const m = parseInt(searchParams.get('month') || currentMonth.toString())
    const y = parseInt(searchParams.get('year') || currentYear.toString())
    setSelectedMonths([{ month: m, year: y }])
  }, [searchParams, currentMonth, currentYear])

  useEffect(() => {
    setTotalAmount(selectedMonths.length * student.monthly_fee)
  }, [selectedMonths, student.monthly_fee])

  function toggleMonth(month: number, year: number) {
    setSelectedMonths((prev) => {
      const exists = prev.some(m => m.month === month && m.year === year)
      return exists ? prev.filter(m => !(m.month === month && m.year === year)) : [...prev, { month, year }]
    })
  }

  async function handlePay() {
    if (selectedMonths.length === 0 || !paymentMethod) return
    setLoading(true)

    const res = await fetch('/api/student/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.id,
        months: selectedMonths,
        paymentMethod,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      alert(data.error ?? 'Payment failed. Please try again.')
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Submitted!</h2>
            <p className="text-gray-500 mb-4">Your fee payment has been recorded.</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left text-sm space-y-2">
              <div className="flex justify-between"><span className="text-gray-500">Months</span><span className="font-medium">{selectedMonths.map(m => `${MONTHS[m.month - 1].slice(0,3)} ${m.year}`).join(', ')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold text-blue-600">{formatPKR(totalAmount)}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge className={paymentMethod === 'card' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {paymentMethod === 'card' ? 'Completed' : 'Pending Confirmation'}
                </Badge>
              </div>
            </div>
            {paymentMethod !== 'card' && <p className="text-xs text-gray-400 mb-4">Admin will confirm once the transfer is verified.</p>}
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/student/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/student/dashboard"><Button variant="outline" size="sm"><ChevronLeft className="w-4 h-4" /></Button></Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">Pay Fee â€” {student.name}</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        <Card>
          <CardHeader><CardTitle className="text-base">Select Month(s) to Pay â€” {currentYear}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                const key = `${currentYear}-${m}`
                const alreadyPaid = existingPayments.has(key)
                const isSelected = selectedMonths.some(s => s.month === m && s.year === currentYear)
                const isFuture = m > currentMonth + 1
                return (
                  <button
                    key={m}
                    disabled={alreadyPaid || isFuture}
                    onClick={() => toggleMonth(m, currentYear)}
                    className={`rounded-lg p-2.5 text-xs font-medium border transition-colors ${
                      alreadyPaid ? 'bg-emerald-50 border-emerald-200 text-emerald-600 cursor-not-allowed opacity-70' :
                      isFuture ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed' :
                      isSelected ? 'bg-blue-600 border-blue-600 text-white' :
                      'border-gray-300 hover:border-blue-400 text-gray-700'
                    }`}
                  >
                    {MONTHS[m - 1].slice(0, 3)}
                    {alreadyPaid && <span className="block text-[10px]">âœ“ Paid</span>}
                  </button>
                )
              })}
            </div>
            {selectedMonths.length > 0 && (
              <div className="mt-4 flex justify-between text-sm font-semibold bg-blue-50 rounded-lg p-3">
                <span>{selectedMonths.length} month(s) selected</span>
                <span className="text-blue-600">{formatPKR(totalAmount)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Payment Method</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { method: 'jazzcash' as PaymentMethod, label: 'JazzCash', color: 'text-red-600' },
                { method: 'easypaisa' as PaymentMethod, label: 'EasyPaisa', color: 'text-green-600' },
                { method: 'card' as PaymentMethod, label: 'Card', color: 'text-blue-600' },
              ].map(({ method, label, color }) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${paymentMethod === method ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Smartphone className={`w-5 h-5 ${color}`} />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
            {paymentMethod === 'jazzcash' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                <p className="font-semibold text-red-800 mb-1">JazzCash Transfer</p>
                <p className="text-red-700">Send <strong>{formatPKR(totalAmount)}</strong> to: <strong className="font-mono">0300-1234567</strong></p>
                <p className="text-xs text-gray-500 mt-1">Account: Suleimaniyyah Madarsa. Click submit after sending.</p>
              </div>
            )}
            {paymentMethod === 'easypaisa' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
                <p className="font-semibold text-green-800 mb-1">EasyPaisa Transfer</p>
                <p className="text-green-700">Send <strong>{formatPKR(totalAmount)}</strong> to: <strong className="font-mono">0345-9876543</strong></p>
                <p className="text-xs text-gray-500 mt-1">Account: Suleimaniyyah Madarsa. Click submit after sending.</p>
              </div>
            )}
            {paymentMethod === 'card' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-600">Demo card â€” no real charge will be made.</div>
            )}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={selectedMonths.length === 0 || !paymentMethod || loading}
              onClick={handlePay}
            >
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : paymentMethod === 'card' ? `Pay ${formatPKR(totalAmount)}` : `I Have Sent ${formatPKR(totalAmount)}`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
