import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminNav from './AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/admin')

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/?error=unauthorized')

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminNav userName={profile?.full_name ?? user.email ?? ''} />
      <main className="flex-1 overflow-auto min-w-0">
        <div className="p-4 pt-[72px] lg:p-8 lg:pt-8">{children}</div>
      </main>
    </div>
  )
}
