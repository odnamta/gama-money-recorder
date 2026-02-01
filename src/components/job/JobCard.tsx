'use client'

import { X, Briefcase, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { JobOrder } from '@/types/supabase'

interface JobCardProps {
  /**
   * The job order to display
   */
  job: JobOrder
  /**
   * Callback when the remove/clear button is clicked
   */
  onRemove: () => void
}

/**
 * Card component to display a selected job order
 * 
 * Features:
 * - Displays job_number prominently
 * - Shows customer_name below
 * - Shows origin → destination route
 * - X button to remove/clear the selection
 * - Card-like styling with border, rounded corners, and padding
 */
export function JobCard({ job, onRemove }: JobCardProps) {
  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-3',
        'border border-gray-200 rounded-lg',
        'bg-gray-50'
      )}
    >
      {/* Job Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
          <Briefcase className="w-4 h-4 text-blue-600" />
        </div>
      </div>

      {/* Job Details */}
      <div className="flex-1 min-w-0">
        {/* Job Number */}
        <div className="font-semibold text-gray-900 truncate">
          {job.job_number}
        </div>

        {/* Customer Name */}
        <div className="text-sm text-gray-600 truncate">
          {job.customer_name}
        </div>

        {/* Route: Origin → Destination */}
        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">
            {job.origin} → {job.destination}
          </span>
        </div>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={onRemove}
        className={cn(
          'flex-shrink-0 p-1 rounded-full',
          'text-gray-400 hover:text-gray-600',
          'hover:bg-gray-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          'transition-colors'
        )}
        aria-label="Hapus job order"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
