import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPKR, formatDate } from '@/lib/utils'
import { Plus, User } from 'lucide-react'
import type { Student } from '@/lib/types'

export const revalidate = 30

export default async function AdminStudentsPage() {
  const supabase = await createClient()
  const { data: students } = await supabase.from('students').select('*').order('name')

  const sponsored = (students ?? []).filter((s: Student) => s.fee_type === 'sponsored')
  const selfPaying = (students ?? []).filter((s: Student) => s.fee_type === 'self_paying')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-gray-500 text-sm mt-1">{sponsored.length} sponsored · {selfPaying.length} self-paying</p>
        </div>
        <Link href="/admin/students/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" />Add Student</Button>
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: (students ?? []).length, color: 'text-gray-800' },
          { label: 'Sponsored', value: sponsored.length, color: 'text-emerald-600' },
          { label: 'Fee Pool', value: formatPKR(sponsored.reduce((s: number, st: Student) => s + st.monthly_fee, 0)), color: 'text-blue-600' },
        ].map(({ label, value, color }) => (
          <Card key={label}><CardContent className="p-3 text-center"><p className={`text-base sm:text-xl font-bold truncate ${color}`}>{value}</p><p className="text-[11px] sm:text-xs text-gray-500 mt-1">{label}</p></CardContent></Card>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Student ID</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Class</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Fee</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Type</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(students ?? []).map((student: Student) => (
              <tr key={student.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700">{student.name[0]}</div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      {student.guardian_name && <p className="text-xs text-gray-400">{student.guardian_name}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{student.student_code || '—'}</span>
                  {student.profile_id && <p className="text-xs text-emerald-600 mt-0.5">✓ Registered</p>}
                </td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{student.class_level || '—'}</td>
                <td className="px-4 py-3 font-semibold whitespace-nowrap">{formatPKR(student.monthly_fee)}</td>
                <td className="px-4 py-3">
                  <Badge className={student.fee_type === 'sponsored' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}>
                    {student.fee_type === 'sponsored' ? 'Sponsored' : 'Self-Pay'}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <Badge className={student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                    {student.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/students/${student.id}`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                </td>
              </tr>
            ))}
            {(!students || students.length === 0) && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No students added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
