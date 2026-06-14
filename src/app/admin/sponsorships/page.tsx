import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPKR, formatDate } from '@/lib/utils'
import AllocateButton from './AllocateButton'
import type { Student } from '@/lib/types'

export const revalidate = 0

export default async function SponsorshipsPage() {
  const supabase = await createClient()

  const [{ data: sponsorships }, { data: students }] = await Promise.all([
    supabase.from('student_sponsorships').select('*, donation:donations(donor_name, donor_phone, is_anonymous, created_at), preferred_student:students!student_sponsorships_preferred_student_id_fkey(name, class_level), allocated_student:students!student_sponsorships_allocated_student_id_fkey(name, class_level)').order('created_at', { ascending: false }),
    supabase.from('students').select('id, name, class_level, monthly_fee').eq('fee_type', 'sponsored').eq('status', 'active').order('name'),
  ])

  const unallocated = (sponsorships ?? []).filter((s: any) => !s.allocated_student_id)
  const allocated = (sponsorships ?? []).filter((s: any) => s.allocated_student_id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sponsorships</h1>
        <p className="text-gray-500 text-sm mt-1">Allocate student fee donations to specific students</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-base sm:text-xl font-bold text-yellow-600">{unallocated.length}</p><p className="text-[11px] sm:text-xs text-gray-500 mt-1">Unallocated</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-base sm:text-xl font-bold text-emerald-600">{allocated.length}</p><p className="text-[11px] sm:text-xs text-gray-500 mt-1">Allocated</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-base sm:text-xl font-bold text-blue-600">{(students ?? []).length}</p><p className="text-[11px] sm:text-xs text-gray-500 mt-1">Students</p></CardContent></Card>
      </div>

      {unallocated.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-amber-800">Pending Allocation ({unallocated.length})</CardTitle>
            <p className="text-xs text-amber-600">These donations need to be assigned to a student</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {unallocated.map((s: any) => (
              <div key={s.id} className="border rounded-lg p-4 bg-amber-50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-emerald-600">{formatPKR(s.total_amount)}</p>
                      <Badge variant="outline" className="text-xs">{s.months_count} month(s)</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Donor: {s.donation?.is_anonymous ? 'Anonymous' : (s.donation?.donor_name || '—')}</p>
                    {s.preferred_student && (
                      <p className="text-xs text-blue-600 mt-1">Preferred: {s.preferred_student.name} (Class {s.preferred_student.class_level})</p>
                    )}
                    {!s.preferred_student_id && (
                      <p className="text-xs text-gray-400 mt-1">No preference — allocate to any needy student</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(s.created_at)}</p>
                  </div>
                  <AllocateButton sponsorshipId={s.id} students={(students ?? []) as Student[]} preferredStudentId={s.preferred_student_id} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {allocated.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Allocated Sponsorships</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[420px]">
              <thead className="bg-gray-50 border-y">
                <tr>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Donor</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Amount</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Allocated To</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium hidden sm:table-cell">Months</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {allocated.map((s: any) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{s.donation?.is_anonymous ? 'Anonymous' : (s.donation?.donor_name || '—')}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 whitespace-nowrap">{formatPKR(s.total_amount)}</td>
                    <td className="px-4 py-3">{s.allocated_student?.name} <span className="text-gray-400 text-xs">(Class {s.allocated_student?.class_level})</span></td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{s.months_count}</td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell whitespace-nowrap">{formatDate(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
