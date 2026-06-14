import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditStudentForm from './EditStudentForm'

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const [{ data: student }, { data: sponsorships }] = await Promise.all([
    supabase.from('students').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('student_sponsorships')
      .select('id, months_count, total_amount, created_at, donation:donations(donor_name, is_anonymous, amount, created_at)')
      .eq('allocated_student_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!student) redirect('/admin/students')

  return <EditStudentForm student={student} sponsorships={sponsorships ?? []} />
}
