'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, ChevronRight, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format-currency'

/**
 * Get the start of the current month (1st day 00:00:00)
 */
function getStartOfMonth(date: Date): Date {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

interface TeamStats {
  totalAmount: number
  expenseCount: number
  activeUsers: number
}

/**
 * TeamSummary - Shows team expense summary for operations managers
 *
 * Displays:
 * - Total team expenses this month
 * - Number of expenses recorded
 * - Number of active team members
 *
 * Clicking navigates to a team view (to be implemented in v0.9).
 */
export function TeamSummary() {
  const [stats, setStats] = useState<TeamStats>({
    totalAmount: 0,
    expenseCount: 0,
    activeUsers: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadTeamStats = async () => {
      try {
        const supabase = createClient()
        const monthStart = getStartOfMonth(new Date())
          .toISOString()
          .split('T')[0]

        // Get all expenses from this month
        const { data: expenses, error } = await supabase
          .from('expense_drafts')
          .select('amount, user_id')
          .gte('expense_date', monthStart)

        if (error) {
          console.error('Failed to load team stats:', error)
          return
        }

        if (!expenses || expenses.length === 0) {
          setStats({ totalAmount: 0, expenseCount: 0, activeUsers: 0 })
          return
        }

        // Calculate stats
        const totalAmount = expenses.reduce(
          (sum, exp) => sum + (exp.amount || 0),
          0
        )
        const expenseCount = expenses.length
        const uniqueUsers = new Set(expenses.map((exp) => exp.user_id))
        const activeUsers = uniqueUsers.size

        setStats({ totalAmount, expenseCount, activeUsers })
      } catch (error) {
        console.error('Failed to load team stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTeamStats()

    // Poll for updates every 60 seconds
    const interval = setInterval(loadTeamStats, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleClick = () => {
    // Navigate to team view (to be implemented in v0.9)
    // For now, navigate to history
    router.push('/history')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={handleClick}
        className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
      >
        {/* Icon */}
        <div className="flex-shrink-0 p-2.5 rounded-full bg-blue-100">
          <Users className="h-5 w-5 text-blue-600" />
        </div>

        {/* Content */}
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-gray-900">Ringkasan Tim</h3>
          {isLoading ? (
            <p className="text-sm text-gray-500">Memuat...</p>
          ) : (
            <p className="text-sm text-gray-600">
              {formatCurrency(stats.totalAmount, { compact: true })} bulan ini
            </p>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </button>

      {/* Stats Grid */}
      {!isLoading && stats.expenseCount > 0 && (
        <div className="px-4 pb-4 grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs text-gray-600">Transaksi</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {stats.expenseCount}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs text-gray-600">Anggota Aktif</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {stats.activeUsers}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
