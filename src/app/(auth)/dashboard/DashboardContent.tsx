'use client'

import { WifiOff } from 'lucide-react'
import { useUser } from '@/hooks/use-user'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { DashboardSyncStatus } from '@/components/dashboard/DashboardSyncStatus'
import { RecentExpenses } from '@/components/dashboard/RecentExpenses'
import { ManagerSection } from '@/components/dashboard/ManagerSection'

/**
 * DashboardContent - Client component for dashboard page
 *
 * Handles:
 * - User greeting
 * - Offline indicator
 * - Pull-to-refresh
 * - All dashboard sections
 */
export function DashboardContent() {
  const { user, profile, isLoading: isUserLoading } = useUser()
  const isOnline = useOnlineStatus()

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    // Refresh will be handled by individual components
    // that subscribe to their own data sources
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  const { isRefreshing } = usePullToRefresh({
    onRefresh: handleRefresh,
  })

  // Get first name for greeting
  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Selamat datang,</p>
            <h1 className="text-xl font-bold">
              {isUserLoading ? 'Memuat...' : firstName}
            </h1>
          </div>
        </div>

        {/* Offline Indicator */}
        {!isOnline && (
          <div className="mt-3 flex items-center gap-2 text-amber-600 text-sm">
            <WifiOff className="h-4 w-4" />
            <span>Mode Offline</span>
          </div>
        )}

        {/* Pull-to-refresh indicator */}
        {isRefreshing && (
          <div className="mt-3 text-center">
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Summary Cards */}
        <SummaryCards />

        {/* Quick Actions */}
        <QuickActions />

        {/* Sync Status */}
        <DashboardSyncStatus />

        {/* Recent Expenses */}
        <RecentExpenses />

        {/* Manager Section (role-based) */}
        <ManagerSection />
      </div>
    </div>
  )
}
