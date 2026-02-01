'use client'

import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { JobOrder } from '@/types/supabase'

interface RecentJobsListProps {
  /**
   * Array of recent job orders to display
   */
  jobs: JobOrder[]
  /**
   * Callback when a job is selected
   */
  onSelect: (jobId: string) => void
}

/**
 * Component to display recent job orders for quick selection
 * 
 * Features:
 * - Displays a "Terakhir Digunakan" label with clock icon
 * - Shows each job as a compact, clickable chip/button
 * - Displays job_number prominently
 * - Shows customer_name (truncated if needed)
 * - Handles empty state gracefully (renders nothing if no jobs)
 * - Horizontal scrollable layout for mobile-friendly UX
 */
export function RecentJobsList({ jobs, onSelect }: RecentJobsListProps) {
  // Don't render anything if there are no recent jobs
  if (!jobs || jobs.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <Clock className="w-3.5 h-3.5" />
        <span>Terakhir Digunakan</span>
      </div>

      {/* Job Chips - Horizontal scrollable */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {jobs.map((job) => (
          <button
            key={job.id}
            type="button"
            onClick={() => onSelect(job.id)}
            className={cn(
              'flex-shrink-0 px-3 py-2 rounded-lg',
              'border border-gray-200 bg-white',
              'hover:bg-blue-50 hover:border-blue-300',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
              'transition-colors',
              'text-left'
            )}
          >
            {/* Job Number - Prominent */}
            <div className="font-medium text-sm text-gray-900 whitespace-nowrap">
              {job.job_number}
            </div>
            {/* Customer Name - Truncated */}
            <div className="text-xs text-gray-500 truncate max-w-[120px]">
              {job.customer_name}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
