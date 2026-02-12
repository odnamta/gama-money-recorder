import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ApprovalPageContent } from './ApprovalPageContent'

/**
 * Approval Page - For finance roles to approve/reject expenses
 * 
 * Access restricted to: owner, director, finance_manager
 */
export default async function ApprovalPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/login')
  }

  // Check user role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const allowedRoles = ['owner', 'director', 'finance_manager']
  
  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect('/dashboard')
  }

  return <ApprovalPageContent userName={profile.full_name} />
}
