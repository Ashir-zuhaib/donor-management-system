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

export default function NewStudentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', student_code: '', age: '', class_level: '', monthly_fee: '2000',
    fee_type: 'sponsored', guardian_name: '', guardian_contact: '',
    enrollment_date: '', notes: '',
  })
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to add student.')
      setLoading(false)
      return
    }
    router.push('/admin/students')
    router.refresh()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/students"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Add Student</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={(e) => set('name', e.target.value)} className="mt-1" required />
              </div>
              <div>
                <Label>Student ID <span className="text-gray-400 font-normal text-xs">(for self-pay login)</span></Label>
                <Input value={form.student_code} onChange={(e) => set('student_code', e.target.value)} className="mt-1 uppercase" placeholder="e.g. STD-001" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Age</Label>
                <Input type="number" value={form.age} onChange={(e) => set('age', e.target.value)} className="mt-1" min={4} max={25} />
              </div>
              <div>
                <Label>Class / Level</Label>
                <Input value={form.class_level} onChange={(e) => set('class_level', e.target.value)} className="mt-1" placeholder="e.g., Hifz Year 2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Monthly Fee (PKR) *</Label>
                <Input type="number" value={form.monthly_fee} onChange={(e) => set('monthly_fee', e.target.value)} className="mt-1" min={0} required />
              </div>
              <div>
                <Label>Fee Type</Label>
                <select className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.fee_type} onChange={(e) => set('fee_type', e.target.value)}>
                  <option value="sponsored">Sponsored (needs donors)</option>
                  <option value="self_paying">Self-Paying</option>
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
                <Input value={form.guardian_contact} onChange={(e) => set('guardian_contact', e.target.value)} className="mt-1" placeholder="03XX-XXXXXXX" />
              </div>
            </div>
            <div>
              <Label>Enrollment Date</Label>
              <Input type="date" value={form.enrollment_date} onChange={(e) => set('enrollment_date', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} className="mt-1" rows={2} placeholder="Any additional information..." />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
            <div className="flex gap-3">
              <Link href="/admin/students" className="flex-1"><Button variant="outline" className="w-full" type="button">Cancel</Button></Link>
              <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</> : 'Add Student'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
