'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JobOrder } from '@/types/supabase'

interface UseRecentJobsReturn {
  recentJobs: JobOrder[]
  isLoading: boolean
  error: Error | null
  refresh: () => void
}

const DEFAULT_LIMIT = 5
const MAX_EXPENSES_TO_SCAN = 50

/**
 * Hook for fetching user's recently linked job orders
 * 
 * Gets recent job IDs from user's expense_drafts (where job_order_id is not null)
 * Returns unique job IDs, limited to 5 most recent
 * Only returns active jobs (status = 'active')
 * Maintains order based on most recently used
 * 
 * @param limit - Maximum number of recent jobs to return (default: 5)
 * @returns Object with recentJobs array, loading state, error, and refresh function
 */
export function useRecentJobs(limit = DEFAULT_LIMIT): UseRecentJobsReturn {
  const [recentJobs, setRecentJobs] = useState<JobOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchRecentJobs = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Step 1: Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw new Error(userError.message)
      }
      
      if (!user) {
        // No user logged in - return empty array
        setRecentJobs([])
        setIsLoading(false)
        return
      }

      // Step 2: Get recent job IDs from user's expenses
      // Query expense_drafts for expenses with job_order_id, ordered by most recent
      const { data: expenses, error: expensesError } = await supabase
        .from('expense_drafts')
        .select('job_order_id, created_at')
        .eq('user_id', user.id)
        .not('job_order_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(MAX_EXPENSES_TO_SCAN)

      if (expensesError) {
        throw new Error(expensesError.message)
      }

      // Step 3: Extract unique job IDs (maintaining order - most recent first)
      const uniqueJobIds: string[] = []
      const seenIds = new Set<string>()
      
      for (const expense of expenses || []) {
        const jobId = expense.job_order_id
        if (jobId && !seenIds.has(jobId)) {
          seenIds.add(jobId)
          uniqueJobIds.push(jobId)
          
          // Stop once we have enough unique IDs
          if (uniqueJobIds.length >= limit) {
            break
          }
        }
      }

      // Step 4: Handle case when user has no recent jobs
      if (uniqueJobIds.length === 0) {
        setRecentJobs([])
        setIsLoading(false)
        return
      }

      // Step 5: Fetch job details for the unique IDs
      // Only fetch active jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('job_orders')
        .select('id, job_number, customer_name, origin, destination, status')
        .in('id', uniqueJobIds)
        .eq('status', 'active')

      if (jobsError) {
        throw new Error(jobsError.message)
      }

      // Step 6: Sort jobs by the original order (most recently used first)
      // This preserves the order from expense_drafts
      const sortedJobs = uniqueJobIds
        .map(id => jobs?.find(job => job.id === id))
        .filter((job): job is JobOrder => job !== undefined)

      setRecentJobs(sortedJobs)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Gagal memuat job order terbaru'))
      setRecentJobs([])
    } finally {
      setIsLoading(false)
    }
  }, [limit])

  // Fetch recent jobs on mount and when limit changes
  useEffect(() => {
    fetchRecentJobs()
  }, [fetchRecentJobs])

  // Refresh function to manually refetch
  const refresh = useCallback(() => {
    fetchRecentJobs()
  }, [fetchRecentJobs])

  return {
    recentJobs,
    isLoading,
    error,
    refresh,
  }
}
