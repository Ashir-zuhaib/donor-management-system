export type Role = 'admin' | 'donor'
export type EntityType = 'masjid' | 'madarsa'
export type CampaignStatus = 'active' | 'completed' | 'cancelled'
export type DonationType =
  | 'masjid_general'
  | 'masjid_campaign'
  | 'madarsa_general'
  | 'madarsa_campaign'
  | 'student_fee'
export type DonationStatus = 'pending' | 'completed' | 'failed'
export type PaymentMethod = 'jazzcash' | 'easypaisa' | 'card' | 'bank_transfer'
export type FeeType = 'self_paying' | 'sponsored'
export type StudentStatus = 'active' | 'graduated' | 'withdrawn'

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  role: Role
  created_at: string
}

export interface Campaign {
  id: string
  title: string
  description: string | null
  entity_type: EntityType
  target_amount: number | null
  collected_amount: number
  start_date: string | null
  end_date: string | null
  status: CampaignStatus
  image_url: string | null
  is_featured: boolean
  created_by: string | null
  created_at: string
}

export interface Student {
  id: string
  name: string
  age: number | null
  class_level: string | null
  monthly_fee: number
  fee_type: FeeType
  guardian_name: string | null
  guardian_contact: string | null
  enrollment_date: string | null
  status: StudentStatus
  photo_url: string | null
  notes: string | null
  student_code: string | null
  profile_id: string | null
  created_at: string
}

export interface FeePayment {
  id: string
  student_id: string
  profile_id: string | null
  month: number
  year: number
  amount: number
  payment_method: PaymentMethod | null
  payment_ref: string | null
  status: DonationStatus
  receipt_number: string | null
  notes: string | null
  created_at: string
  student?: Student
}

export interface Donation {
  id: string
  donor_id: string | null
  donor_name: string | null
  donor_email: string | null
  donor_phone: string | null
  donation_type: DonationType
  campaign_id: string | null
  amount: number
  currency: string
  message: string | null
  is_anonymous: boolean
  status: DonationStatus
  payment_method: PaymentMethod | null
  payment_ref: string | null
  receipt_number: string | null
  created_at: string
  campaign?: Campaign
  profile?: Profile
}

export interface StudentSponsorship {
  id: string
  donation_id: string
  preferred_student_id: string | null
  allocated_student_id: string | null
  months_count: number
  monthly_amount: number
  total_amount: number
  academic_year: string | null
  notes: string | null
  created_at: string
  preferred_student?: Student
  allocated_student?: Student
  donation?: Donation
}

export interface Announcement {
  id: string
  title: string
  content: string | null
  entity_type: EntityType | 'general'
  is_published: boolean
  image_url: string | null
  created_by: string | null
  created_at: string
  published_at: string | null
}

export interface DashboardStats {
  totalMasjidAmount: number
  totalMadarsaAmount: number
  totalDonations: number
  pendingDonations: number
  activeCampaigns: number
  totalStudents: number
  sponsoredStudents: number
  unallocatedSponsorships: number
}
