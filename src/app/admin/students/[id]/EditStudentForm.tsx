'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatPKR, formatDate } from '@/lib/utils'
import type { Student } from '@/lib/types'

type Sponsorship = {
  id: string
  months_count: number
  total_amount: number
  created_at: string
  donation: { donor_name: string; is_anonymous: boolean; amount: number; created_at: string }[] | null
}

export default function EditStudentForm({ student, sponsorships }: { student: Student; sponsorships: Sponsorship[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: student.name,
    age: student.age?.toString() || '',
    class_level: student.class_level || '',
    monthly_fee: student.monthly_fee.toString(),
    fee_type: student.fee_type,
    guardian_name: student.guardian_name || '',
    guardian_contact: student.guardian_contact || '',
    notes: student.notes || '',
    status: student.status,
  })
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch(`/api/admin/students/${student.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        age: form.age ? Number(form.age) : null,
        class_level: form.class_level || null,
        monthly_fee: Number(form.monthly_fee),
        fee_type: form.fee_type,
        guardian_name: form.guardian_name || null,
        guardian_contact: form.guardian_contact || null,
        notes: form.notes || null,
        status: form.status,
      }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to save changes.')
    } else {
      router.push('/admin/students')
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/students"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Edit Student</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={(e) => set('name', e.target.value)} className="mt-1" required />
              </div>
              <div>
                <Label>Age</Label>
                <Input type="number" value={form.age} onChange={(e) => set('age', e.target.value)} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Class / Level</Label>
                <Input value={form.class_level} onChange={(e) => set('class_level', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Monthly Fee (PKR)</Label>
                <Input type="number" value={form.monthly_fee} onChange={(e) => set('monthly_fee', e.target.value)} className="mt-1" min={0} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fee Type</Label>
                <select className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.fee_type} onChange={(e) => set('fee_type', e.target.value)}>
                  <option value="sponsored">Sponsored</option>
                  <option value="self_paying">Self-Paying</option>
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="graduated">Graduated</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Guardian Name</Label>
                <Input value={form.guardian_name} onChange={(e) => set('guardian_name', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Guardian Contact</Label>
                <Input value={form.guardian_contact} onChange={(e) => set('guardian_contact', e.target.value)} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} className="mt-1" rows={2} />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
            <div className="flex gap-3">
              <Link href="/admin/students" className="flex-1"><Button variant="outline" className="w-full" type="button">Cancel</Button></Link>
              <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {sponsorships.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-3">Sponsorships Received ({sponsorships.length})</h3>
            <div className="space-y-2">
              {sponsorships.map((s) => (
                <div key={s.id} className="flex justify-between text-sm py-2 border-b last:border-0">
                  <div>
                    <p>{s.donation?.[0]?.is_anonymous ? 'Anonymous' : (s.donation?.[0]?.donor_name || '—')}</p>
                    <p className="text-xs text-gray-400">{s.months_count} months · {formatDate(s.created_at)}</p>
                  </div>
                  <p className="font-semibold text-emerald-600">{formatPKR(s.total_amount)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
