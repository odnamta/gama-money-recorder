'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardCheck, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

/**
 * PendingApprovals - Shows count of expenses pending approval
 *
 * For finance managers to see how many expenses need their review.
 * Clicking navigates to the approval page (to be implemented in v0.9).
 */
export function PendingApprovals() {
  const [count, setCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const supabase = createClient()

        // Count expenses with pending_approval status
        const { count: pendingCount, error } = await supabase
          .from('expense_drafts')
          .select('*', { count: 'exact', head: true })
          .eq('approval_status', 'pending_approval')

        if (error) {
          console.error('Failed to load pending approvals:', error)
          return
        }

        setCount(pendingCount ?? 0)
      } catch (error) {
        console.error('Failed to load pending approvals:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPendingCount()

    // Poll for updates every 30 seconds
    const interval = setInterval(loadPendingCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Don't show if no pending approvals
  if (!isLoading && count === 0) {
    return null
  }

  const handleClick = () => {
    // Navigate to approvals page (to be implemented in v0.9)
    // For now, navigate to history with a filter
    router.push('/history?status=pending_approval')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={handleClick}
        className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
      >
        {/* Icon */}
        <div className="flex-shrink-0 p-2.5 rounded-full bg-amber-100">
          <ClipboardCheck className="h-5 w-5 text-amber-600" />
        </div>

        {/* Content */}
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-gray-900">Menunggu Persetujuan</h3>
          {isLoading ? (
            <p className="text-sm text-gray-500">Memuat...</p>
          ) : (
            <p className="text-sm text-gray-600">
              {count} pengeluaran perlu ditinjau
            </p>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </button>

      {/* Badge for count */}
      {!isLoading && count > 0 && (
        <div className="px-4 pb-3">
          <div
            className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
              count > 10
                ? 'bg-red-100 text-red-800'
                : 'bg-amber-100 text-amber-800'
            )}
          >
            {count > 99 ? '99+' : count} item
          </div>
        </div>
      )}
    </div>
  )
}
