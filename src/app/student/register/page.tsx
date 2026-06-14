'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BookOpen, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type StudentInfo = {
  studentId: string
  name: string
  classLevel: string | null
  monthlyFee: number
}

export default function StudentRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null)
  const [form, setForm] = useState({ studentCode: '', email: '', password: '', confirmPassword: '' })

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  async function verifyStudentCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/student/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentCode: form.studentCode }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Verification failed.')
      setLoading(false)
      return
    }

    setStudentInfo(data as StudentInfo)
    setStep(2)
    setLoading(false)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!studentInfo) return
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: studentInfo.name } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Link the student record to this new profile via our API
      const linkRes = await fetch('/api/student/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: studentInfo.studentId, profileId: data.user.id, fullName: studentInfo.name }),
      })
      if (!linkRes.ok) {
        const linkData = await linkRes.json()
        setError(linkData.error ?? 'Account created but linking failed. Contact admin.')
        setLoading(false)
        return
      }
    }

    router.push('/student/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <CardTitle>Student Registration</CardTitle>
          <p className="text-sm text-gray-500">Create your account using your Student ID</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>1</div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>2</div>
          </div>

          {step === 1 && (
            <form onSubmit={verifyStudentCode} className="space-y-4">
              <div>
                <Label>Student ID</Label>
                <Input
                  value={form.studentCode}
                  onChange={(e) => set('studentCode', e.target.value)}
                  placeholder="e.g. STD-001"
                  className="mt-1 uppercase"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Your Student ID is provided by the Madarsa administration.</p>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : 'Verify Student ID'}
              </Button>
            </form>
          )}

          {step === 2 && studentInfo && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">Student Verified</span>
                </div>
                <p className="text-sm text-blue-700"><strong>Name:</strong> {studentInfo.name}</p>
                <p className="text-sm text-blue-700"><strong>Class:</strong> {studentInfo.classLevel || '—'}</p>
                <p className="text-sm text-blue-700"><strong>Monthly Fee:</strong> PKR {studentInfo.monthlyFee.toLocaleString()}</p>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label>Email Address</Label>
                  <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="your@email.com" className="mt-1" required />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Min. 8 characters" className="mt-1" required minLength={8} />
                </div>
                <div>
                  <Label>Confirm Password</Label>
                  <Input type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} placeholder="Re-enter password" className="mt-1" required />
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : 'Create Account'}
                </Button>
                <button type="button" onClick={() => { setStep(1); setError('') }} className="w-full text-sm text-gray-400 hover:text-gray-600">
                  ← Change Student ID
                </button>
              </form>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account? <Link href="/student/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
