'use client'

import { useUser } from '@/hooks/use-user'
import { PendingApprovals } from './PendingApprovals'
import { TeamSummary } from './TeamSummary'

/**
 * ManagerSection - Role-specific dashboard content for managers
 *
 * Shows different content based on user role:
 * - Finance managers: Pending approvals count
 * - Operations managers: Team expense summary
 * - Owner/Director: Both pending approvals and team summary
 *
 * Regular users (ops, engineer, finance staff) don't see this section.
 */
export function ManagerSection() {
  const { profile, isLoading } = useUser()

  // Don't show anything while loading
  if (isLoading) {
    return null
  }

  // Only show for managers
  if (
    !profile ||
    !['finance_manager', 'operations_manager', 'owner', 'director'].includes(
      profile.role
    )
  ) {
    return null
  }

  const isFinanceRole = ['finance_manager', 'owner', 'director'].includes(
    profile.role
  )
  const isOperationsRole = [
    'operations_manager',
    'owner',
    'director',
  ].includes(profile.role)

  return (
    <div className="space-y-4">
      {/* Finance managers see pending approvals */}
      {isFinanceRole && <PendingApprovals />}

      {/* Operations managers see team summary */}
      {isOperationsRole && <TeamSummary />}
    </div>
  )
}
