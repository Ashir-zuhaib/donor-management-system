'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Heart, BookOpen, Users, CheckCircle, Loader2, ChevronRight, ChevronLeft, Smartphone, CreditCard, Building } from 'lucide-react'
import { formatPKR } from '@/lib/utils'
import type { Campaign, Student, DonationType, PaymentMethod } from '@/lib/types'

type Step = 1 | 2 | 3 | 4

interface DonationState {
  donationType: DonationType | ''
  campaignId: string
  amount: string
  studentCount: number
  monthsCount: number
  preferredStudentId: string
  donorName: string
  donorEmail: string
  donorPhone: string
  message: string
  isAnonymous: boolean
  paymentMethod: PaymentMethod | ''
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000]

export default function DonationWizard({
  campaigns,
  students,
  initialType,
  initialCampaignId,
  userId,
  userProfile,
}: {
  campaigns: Campaign[]
  students: Student[]
  initialType?: string
  initialCampaignId?: string
  userId?: string
  userProfile?: { full_name?: string; phone?: string } | null
}) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [receiptNumber, setReceiptNumber] = useState('')
  const [form, setForm] = useState<DonationState>({
    donationType: (initialType as DonationType) || '',
    campaignId: initialCampaignId || '',
    amount: '',
    studentCount: 1,
    monthsCount: 1,
    preferredStudentId: '',
    donorName: userProfile?.full_name || '',
    donorEmail: '',
    donorPhone: userProfile?.phone || '',
    message: '',
    isAnonymous: false,
    paymentMethod: '',
  })

  const set = (key: keyof DonationState, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const isStudentFee = form.donationType === 'student_fee'
  const isCampaign = form.donationType?.includes('campaign')
  const totalStudentAmount = isStudentFee
    ? form.studentCount * form.monthsCount * getMonthlyFee()
    : 0

  function getMonthlyFee() {
    if (form.preferredStudentId) {
      const s = students.find((s) => s.id === form.preferredStudentId)
      return s?.monthly_fee ?? 2000
    }
    return 2000
  }

  const donationAmount = isStudentFee ? totalStudentAmount : Number(form.amount || 0)

  const selectedCampaign = campaigns.find((c) => c.id === form.campaignId)

  async function handleSubmit() {
    setLoading(true)
    try {
      const res = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationType: form.donationType,
          campaignId: form.campaignId || null,
          amount: donationAmount,
          studentCount: form.studentCount,
          monthsCount: form.monthsCount,
          preferredStudentId: form.preferredStudentId || null,
          monthlyFee: getMonthlyFee(),
          donorName: form.donorName,
          donorEmail: form.donorEmail || null,
          donorPhone: form.donorPhone || null,
          message: form.message || null,
          isAnonymous: form.isAnonymous,
          paymentMethod: form.paymentMethod,
          userId: userId || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong.')

      setReceiptNumber(data.receiptNumber)
      setStep(4)
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 4) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">JazakAllah Khair!</h2>
          <p className="text-gray-500 mb-4">Your donation has been recorded. May Allah accept your generosity.</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Receipt #</span><span className="font-mono font-medium">{receiptNumber}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-bold text-emerald-600">{formatPKR(donationAmount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="capitalize">{form.donationType?.replace(/_/g, ' ')}</span></div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <Badge className={form.paymentMethod === 'card' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {form.paymentMethod === 'card' ? 'Completed' : 'Pending Confirmation'}
              </Badge>
            </div>
          </div>
          {form.paymentMethod !== 'card' && (
            <p className="text-xs text-gray-400 mb-6">Our admin will confirm your payment shortly after verifying the transfer.</p>
          )}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => router.push('/')}>Back to Home</Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => router.push('/donate')}>Donate Again</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'}`}>{s}</div>
            {s < 3 && <div className={`flex-1 h-1 transition-colors ${step > s ? 'bg-emerald-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mb-8 -mt-4">
        <span>Select Type</span><span className="ml-8">Your Details</span><span>Payment</span>
      </div>

      {/* Step 1: Donation Type */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle>What would you like to donate to?</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {[
                { type: 'masjid_general' as DonationType, icon: Heart, title: 'Masjid General Fund', desc: 'Support daily operations & maintenance' },
                { type: 'madarsa_general' as DonationType, icon: BookOpen, title: 'Madarsa General Fund', desc: 'Support education & Madarsa operations' },
                { type: 'student_fee' as DonationType, icon: Users, title: 'Sponsor Student Fees', desc: 'Pay fees for students who study on scholarship' },
              ].map(({ type, icon: Icon, title, desc }) => (
                <button
                  key={type}
                  onClick={() => { set('donationType', type); set('campaignId', '') }}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-colors ${form.donationType === type ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${form.donationType === type ? 'bg-emerald-600' : 'bg-gray-100'}`}>
                    <Icon className={`w-5 h-5 ${form.donationType === type ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Campaign sub-options */}
            {(form.donationType === 'masjid_general' || form.donationType === 'madarsa_general') && (
              (() => {
                const entity = form.donationType === 'masjid_general' ? 'masjid' : 'madarsa'
                const entityCampaigns = campaigns.filter((c) => c.entity_type === entity)
                if (entityCampaigns.length === 0) return null
                return (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-3 text-gray-600">Or donate to a specific campaign:</p>
                    <div className="space-y-2">
                      {entityCampaigns.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            set('campaignId', c.id)
                            set('donationType', `${entity}_campaign` as DonationType)
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${form.campaignId === c.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div>
                            <p className="font-medium text-sm">{c.title}</p>
                            {c.target_amount && <p className="text-xs text-gray-400">{formatPKR(c.collected_amount)} raised of {formatPKR(c.target_amount)}</p>}
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })()
            )}

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={!form.donationType}
              onClick={() => setStep(2)}
            >
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Amount & Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Donation Details</CardTitle>
            <p className="text-sm text-gray-500 capitalize">{form.donationType?.replace(/_/g, ' ')}{selectedCampaign ? ` â€” ${selectedCampaign.title}` : ''}</p>
          </CardHeader>
          <CardContent className="space-y-5">
            {isStudentFee ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-emerald-800 mb-3">Student Fee Sponsorship</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Number of Students</Label>
                      <Input type="number" min={1} max={50} value={form.studentCount} onChange={(e) => set('studentCount', parseInt(e.target.value) || 1)} className="mt-1" />
                    </div>
                    <div>
                      <Label>Months to Sponsor</Label>
                      <Input type="number" min={1} max={12} value={form.monthsCount} onChange={(e) => set('monthsCount', parseInt(e.target.value) || 1)} className="mt-1" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Label>Preferred Student (optional)</Label>
                    <select
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={form.preferredStudentId}
                      onChange={(e) => set('preferredStudentId', e.target.value)}
                    >
                      <option value="">Let Madarsa allocate to any needy student</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} (Class {s.class_level || 'â€”'}) â€” {formatPKR(s.monthly_fee)}/month</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">The Madarsa may allocate funds to any deserving student if you leave this blank.</p>
                  </div>
                  <div className="mt-4 p-3 bg-white rounded-lg border">
                    <div className="flex justify-between text-sm">
                      <span>{form.studentCount} student(s) Ã— {form.monthsCount} month(s) Ã— {formatPKR(getMonthlyFee())}</span>
                      <span className="font-bold text-emerald-600">{formatPKR(totalStudentAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Label>Donation Amount (PKR)</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => set('amount', amt.toString())}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${form.amount === amt.toString() ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-300 hover:border-emerald-400'}`}
                    >
                      {formatPKR(amt)}
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  placeholder="Or enter custom amount"
                  value={form.amount}
                  onChange={(e) => set('amount', e.target.value)}
                  min={100}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Your Name</Label>
                <Input value={form.donorName} onChange={(e) => set('donorName', e.target.value)} className="mt-1" placeholder="Full name" disabled={form.isAnonymous} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.donorPhone} onChange={(e) => set('donorPhone', e.target.value)} className="mt-1" placeholder="03XX-XXXXXXX" />
              </div>
            </div>
            <div>
              <Label>Email (optional)</Label>
              <Input type="email" value={form.donorEmail} onChange={(e) => set('donorEmail', e.target.value)} className="mt-1" placeholder="your@email.com" />
            </div>
            <div>
              <Label>Message (optional)</Label>
              <Textarea value={form.message} onChange={(e) => set('message', e.target.value)} className="mt-1" placeholder="A note or dua..." rows={2} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isAnonymous} onChange={(e) => set('isAnonymous', e.target.checked)} className="w-4 h-4 accent-emerald-600" />
              <span className="text-sm text-gray-600">Donate anonymously</span>
            </label>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                disabled={(!isStudentFee && !form.amount) || donationAmount < 100 || !form.donorName}
                onClick={() => setStep(3)}
              >
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Payment</CardTitle>
            <p className="text-sm text-gray-500">Total: <span className="font-bold text-emerald-600 text-base">{formatPKR(donationAmount)}</span></p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label className="mb-3 block">Choose Payment Method</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { method: 'jazzcash' as PaymentMethod, icon: Smartphone, label: 'JazzCash', color: 'text-red-600' },
                  { method: 'easypaisa' as PaymentMethod, icon: Smartphone, label: 'EasyPaisa', color: 'text-green-600' },
                  { method: 'card' as PaymentMethod, icon: CreditCard, label: 'Card', color: 'text-blue-600' },
                ].map(({ method, icon: Icon, label, color }) => (
                  <button
                    key={method}
                    onClick={() => set('paymentMethod', method)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${form.paymentMethod === method ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <Icon className={`w-6 h-6 ${color}`} />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {form.paymentMethod === 'jazzcash' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-semibold text-red-800 mb-2">JazzCash Transfer</p>
                <p className="text-sm text-red-700">Send <strong>{formatPKR(donationAmount)}</strong> to:</p>
                <p className="text-lg font-mono font-bold text-red-800 mt-1">0300-1234567</p>
                <p className="text-xs text-red-600 mt-2">Account Name: Suleimaniyyah Masjid</p>
                <p className="text-xs text-gray-500 mt-2">After sending, click "I Have Sent the Payment" below. Our admin will verify and confirm your donation.</p>
              </div>
            )}

            {form.paymentMethod === 'easypaisa' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-semibold text-green-800 mb-2">EasyPaisa Transfer</p>
                <p className="text-sm text-green-700">Send <strong>{formatPKR(donationAmount)}</strong> to:</p>
                <p className="text-lg font-mono font-bold text-green-800 mt-1">0345-9876543</p>
                <p className="text-xs text-green-600 mt-2">Account Name: Suleimaniyyah Masjid</p>
                <p className="text-xs text-gray-500 mt-2">After sending, click "I Have Sent the Payment" below. Our admin will verify and confirm your donation.</p>
              </div>
            )}

            {form.paymentMethod === 'card' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <p className="font-semibold text-blue-800">Card Payment (Demo)</p>
                <p className="text-xs text-blue-600">This is a demo â€” no real charge will be made.</p>
                <Input placeholder="Card Number: 1234 5678 9012 3456" disabled />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="MM/YY" disabled />
                  <Input placeholder="CVV" disabled />
                </div>
                <Input placeholder="Cardholder Name" disabled />
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)} disabled={loading}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                disabled={!form.paymentMethod || loading}
                onClick={handleSubmit}
              >
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : form.paymentMethod === 'card' ? 'Confirm Donation' : 'I Have Sent the Payment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
