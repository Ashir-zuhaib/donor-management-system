'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { formatPKR } from '@/lib/utils'
import type { Student } from '@/lib/types'

export default function AllocateButton({
  sponsorshipId,
  students,
  preferredStudentId,
}: {
  sponsorshipId: string
  students: Student[]
  preferredStudentId: string | null
}) {
  const [loading, setLoading] = useState(false)
  const [studentId, setStudentId] = useState(preferredStudentId || '')
  const router = useRouter()

  async function allocate() {
    if (!studentId) return alert('Please select a student')
    setLoading(true)
    await fetch('/api/admin/allocate-sponsorship', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sponsorshipId, studentId }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2 min-w-[220px]">
      <select
        className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 text-xs"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      >
        <option value="">Select student</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>{s.name} — {formatPKR(s.monthly_fee)}/mo</option>
        ))}
      </select>
      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs whitespace-nowrap" onClick={allocate} disabled={loading || !studentId}>
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Allocate'}
      </Button>
    </div>
  )
}
