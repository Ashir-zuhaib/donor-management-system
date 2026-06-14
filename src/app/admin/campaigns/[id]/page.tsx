import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditCampaignForm from './EditCampaignForm'

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  const { data: campaign } = await supabase.from('campaigns').select('*').eq('id', id).maybeSingle()
  if (!campaign) redirect('/admin/campaigns')
  return <EditCampaignForm campaign={campaign} />
}
