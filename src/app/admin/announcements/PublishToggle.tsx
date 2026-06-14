'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function PublishToggle({ id, isPublished }: { id: string; isPublished: boolean }) {
  const [loading, setLoading] = useState(false)
  const [published, setPublished] = useState(isPublished)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    await fetch('/api/admin/toggle-announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, publish: !published }),
    })
    setPublished(!published)
    router.refresh()
    setLoading(false)
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle} disabled={loading} className={published ? 'text-red-600 border-red-300' : 'text-emerald-600 border-emerald-300'}>
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : published ? <><EyeOff className="w-3 h-3 mr-1" />Unpublish</> : <><Eye className="w-3 h-3 mr-1" />Publish</>}
    </Button>
  )
}
