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

export default function NewAnnouncementPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', content: '', entity_type: 'general', is_published: false })
  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to save announcement.')
      setLoading(false)
      return
    }
    router.push('/admin/announcements')
    router.refresh()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/announcements"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <h1 className="text-2xl font-bold">New Announcement</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => set('title', e.target.value)} className="mt-1" placeholder="e.g., Ramadan Donation Drive" required />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea value={form.content} onChange={(e) => set('content', e.target.value)} className="mt-1" rows={5} placeholder="Write the announcement details..." />
            </div>
            <div>
              <Label>Category</Label>
              <select className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.entity_type} onChange={(e) => set('entity_type', e.target.value)}>
                <option value="general">General</option>
                <option value="masjid">Masjid</option>
                <option value="madarsa">Madarsa</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} className="w-4 h-4 accent-emerald-600" />
              <span className="text-sm">Publish immediately on the donor site</span>
            </label>
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
            <div className="flex gap-3">
              <Link href="/admin/announcements" className="flex-1"><Button variant="outline" className="w-full" type="button">Cancel</Button></Link>
              <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Announcement'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
