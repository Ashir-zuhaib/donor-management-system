'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function ConfirmFeeButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function confirm() {
    setLoading(true)
    await fetch('/api/admin/confirm-fee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={confirm} disabled={loading}>
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CheckCircle className="w-3 h-3 mr-1" />Confirm</>}
    </Button>
  )
}
