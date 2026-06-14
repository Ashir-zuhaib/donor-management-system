'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function StudentLogoutButton() {
  const router = useRouter()

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/student/login')
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" onClick={logout} className="text-gray-600">
      <LogOut className="w-4 h-4 mr-2" />Logout
    </Button>
  )
}
