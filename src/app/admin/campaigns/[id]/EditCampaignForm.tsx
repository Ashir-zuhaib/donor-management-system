'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatPKR } from '@/lib/utils'
import type { Campaign } from '@/lib/types'

export default function EditCampaignForm({ campaign }: { campaign: Campaign }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: campaign.title,
    description: campaign.description || '',
    entity_type: campaign.entity_type,
    target_amount: campaign.target_amount?.toString() || '',
    start_date: campaign.start_date || '',
    end_date: campaign.end_date || '',
    is_featured: campaign.is_featured,
    status: campaign.status,
  })

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }))

  async function patchCampaign(body: object) {
    const res = await fetch(`/api/admin/campaigns/${campaign.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.ok
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const ok = await patchCampaign({
      title: form.title,
      description: form.description || null,
      entity_type: form.entity_type,
      target_amount: form.target_amount ? Number(form.target_amount) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      is_featured: form.is_featured,
      status: form.status,
    })
    if (!ok) setError('Failed to save changes.')
    else { router.push('/admin/campaigns'); router.refresh() }
    setSaving(false)
  }

  async function handleStatusChange(status: string) {
    setLoading(true)
    await patchCampaign({ status })
    set('status', status)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/campaigns"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Edit Campaign</h1>
        <Badge className={form.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>{form.status}</Badge>
      </div>

      <div className="flex gap-3">
        <div className="bg-emerald-50 rounded-lg p-4 flex-1 text-center">
          <p className="text-xs text-gray-500">Collected</p>
          <p className="text-xl font-bold text-emerald-600">{formatPKR(campaign.collected_amount)}</p>
        </div>
        <div className="flex gap-2 items-center">
          {form.status === 'active' && (
            <>
              <Button size="sm" variant="outline" className="text-yellow-700 border-yellow-300" onClick={() => handleStatusChange('completed')} disabled={loading}>Mark Completed</Button>
              <Button size="sm" variant="outline" className="text-red-700 border-red-300" onClick={() => handleStatusChange('cancelled')} disabled={loading}>Cancel</Button>
            </>
          )}
          {form.status !== 'active' && (
            <Button size="sm" variant="outline" className="text-emerald-700" onClick={() => handleStatusChange('active')} disabled={loading}>Reactivate</Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => set('title', e.target.value)} className="mt-1" required />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} className="mt-1" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>For</Label>
                <select className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.entity_type} onChange={(e) => set('entity_type', e.target.value)}>
                  <option value="masjid">Masjid</option>
                  <option value="madarsa">Madarsa</option>
                </select>
              </div>
              <div>
                <Label>Target Amount (PKR)</Label>
                <Input type="number" value={form.target_amount} onChange={(e) => set('target_amount', e.target.value)} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={form.end_date} onChange={(e) => set('end_date', e.target.value)} className="mt-1" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)} className="w-4 h-4 accent-emerald-600" />
              <span className="text-sm">Feature on homepage</span>
            </label>
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
            <div className="flex gap-3">
              <Link href="/admin/campaigns" className="flex-1"><Button variant="outline" className="w-full" type="button">Cancel</Button></Link>
              <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
