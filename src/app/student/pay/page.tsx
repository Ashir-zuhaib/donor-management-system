import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import StudentPayForm from './StudentPayForm'

export default async function StudentPayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/student/login')

  const [{ data: student }, { data: payments }] = await Promise.all([
    supabase.from('students').select('id, name, monthly_fee, class_level').eq('profile_id', user.id).maybeSingle(),
    supabase.from('fee_payments').select('month, year, status').eq('profile_id', user.id),
  ])

  if (!student) redirect('/student/dashboard')

  const paidKeys = new Set(
    (payments ?? []).filter((p) => p.status !== 'failed').map((p) => `${p.year}-${p.month}`)
  )

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}>
      <StudentPayForm student={student} paidKeys={[...paidKeys]} />
    </Suspense>
  )
}
