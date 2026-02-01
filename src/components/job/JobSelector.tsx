'use client'

import { useState, useCallback } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { JobCard } from './JobCard'
import { JobSearchDialog } from './JobSearchDialog'
import { RecentJobsList } from './RecentJobsList'
import { useRecentJobs } from '@/hooks/use-recent-jobs'
import { useJob } from '@/hooks/use-job'
import type { JobOrder } from '@/types/supabase'

interface JobSelectorProps {
  /**
   * Selected job order ID, or null if no job selected
   */
  value: string | null
  /**
   * Callback when job selection changes
   */
  onChange: (jobId: string | null) => void
  /**
   * Whether the expense is marked as overhead (not linked to a job)
   */
  isOverhead: boolean
  /**
   * Callback when overhead toggle changes
   */
  onOverheadChange: (isOverhead: boolean) => void
  /**
   * Error message to display
   */
  error?: string
  /**
   * Whether the selector is disabled
   */
  disabled?: boolean
}

/**
 * Container component for job order selection
 * 
 * Features:
 * - Overhead toggle at the top
 * - Shows selected job using JobCard when a job is selected
 * - Shows recent jobs list when no job is selected
 * - Search button to open JobSearchDialog
 * - Handles overhead state (when overhead, disables job selection)
 */
export function JobSelector({
  value,
  onChange,
  isOverhead,
  onOverheadChange,
  error,
  disabled = false,
}: JobSelectorProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  
  // Fetch recent jobs for quick selection
  const { recentJobs, isLoading: isLoadingRecent } = useRecentJobs()
  
  // Fetch selected job details
  const { job: selectedJob, isLoading: isLoadingJob } = useJob(value)

  // Handle overhead toggle change
  const handleOverheadChange = useCallback(
    (checked: boolean) => {
      onOverheadChange(checked)
      // Clear job selection when switching to overhead
      if (checked) {
        onChange(null)
      }
    },
    [onOverheadChange, onChange]
  )

  // Handle job selection from search dialog
  const handleJobSelect = useCallback(
    (job: JobOrder) => {
      onChange(job.id)
      setIsSearchOpen(false)
    },
    [onChange]
  )

  // Handle job removal
  const handleRemoveJob = useCallback(() => {
    onChange(null)
  }, [onChange])

  // Handle recent job selection
  const handleRecentJobSelect = useCallback(
    (jobId: string) => {
      onChange(jobId)
    },
    [onChange]
  )

  return (
    <div className="space-y-3">
      {/* Overhead Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor="job-overhead-toggle" className="text-sm font-medium text-gray-700">
          Terkait Job Order
        </Label>
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-sm',
            isOverhead ? 'text-gray-900 font-medium' : 'text-gray-500'
          )}>
            Overhead
          </span>
          <Switch
            id="job-overhead-toggle"
            checked={isOverhead}
            onCheckedChange={handleOverheadChange}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Job Selection UI - Only shown when not overhead */}
      {!isOverhead && (
        <div className={cn(
          'space-y-3',
          disabled && 'opacity-50 pointer-events-none'
        )}>
          {/* Loading state for selected job */}
          {isLoadingJob && value && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}

          {/* Selected Job Display */}
          {selectedJob && !isLoadingJob && (
            <JobCard
              job={selectedJob}
              onRemove={handleRemoveJob}
            />
          )}

          {/* No job selected - show recent jobs and search */}
          {!value && !isLoadingJob && (
            <>
              {/* Recent Jobs */}
              {!isLoadingRecent && recentJobs.length > 0 && (
                <RecentJobsList
                  jobs={recentJobs}
                  onSelect={handleRecentJobSelect}
                />
              )}

              {/* Loading recent jobs */}
              {isLoadingRecent && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}

              {/* Search Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsSearchOpen(true)}
                disabled={disabled}
              >
                <Search className="h-4 w-4" />
                Cari Job Order
              </Button>
            </>
          )}

          {/* Search Dialog */}
          <JobSearchDialog
            open={isSearchOpen}
            onOpenChange={setIsSearchOpen}
            onSelect={handleJobSelect}
          />
        </div>
      )}

      {/* Overhead indicator */}
      {isOverhead && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-800">
            Pengeluaran ini akan dicatat sebagai overhead (tidak terkait job order tertentu).
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
