import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import DonationWizard from '@/components/donation/DonationWizard'
import type { Campaign, Student } from '@/lib/types'

export default async function DonatePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; campaign?: string }>
}) {
  const { type, campaign } = await searchParams
  const supabase = await createClient()

  const [{ data: campaigns }, { data: students }, { data: { user } }] = await Promise.all([
    supabase.from('campaigns').select('*').eq('status', 'active').order('created_at', { ascending: false }),
    supabase.from('students').select('*').eq('fee_type', 'sponsored').eq('status', 'active').order('name'),
    supabase.auth.getUser(),
  ])

  let userProfile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('full_name, phone').eq('id', user.id).single()
    userProfile = data
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar userRole={null} />
      <div className="max-w-2xl mx-auto w-full px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Make a Donation</h1>
          <p className="text-gray-500 mt-2">Choose where your donation goes and complete the payment.</p>
        </div>
        <DonationWizard
          campaigns={(campaigns ?? []) as Campaign[]}
          students={(students ?? []) as Student[]}
          initialType={type}
          initialCampaignId={campaign}
          userId={user?.id}
          userProfile={userProfile}
        />
      </div>
    </div>
  )
}
