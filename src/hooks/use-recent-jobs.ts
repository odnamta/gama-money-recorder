'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCachedJobOrders } from '@/lib/db/job-cache'
import type { JobOrder } from '@/types/supabase'
import type { CachedJobOrder } from '@/lib/db'

interface UseRecentJobsReturn {
  /** Array of recent job orders */
  recentJobs: JobOrder[]
  /** Whether jobs are being loaded */
  isLoading: boolean
  /** Error from the fetch operation */
  error: Error | null
  /** Whether results are from local cache (offline mode) */
  isUsingCache: boolean
  /** Manually refresh the recent jobs list */
  refresh: () => void
}

const DEFAULT_LIMIT = 5
const MAX_EXPENSES_TO_SCAN = 50

/**
 * Convert a CachedJobOrder to JobOrder format
 * 
 * Maps the camelCase cached format to snake_case Supabase format
 */
function cachedToJobOrder(cached: CachedJobOrder): JobOrder {
  return {
    id: cached.id,
    job_number: cached.jobNumber,
    customer_name: cached.customerName,
    origin: cached.origin,
    destination: cached.destination,
    status: 'active', // Cached jobs are always active
  }
}

/**
 * Hook for fetching user's recently linked job orders with offline support
 * 
 * Gets recent job IDs from user's expense_drafts (where job_order_id is not null)
 * Returns unique job IDs, limited to 5 most recent
 * Only returns active jobs (status = 'active')
 * Maintains order based on most recently used
 * 
 * Offline behavior:
 * - When offline, returns cached jobs from IndexedDB
 * - When online, prefers Supabase but falls back to cache on error
 * - Returns isUsingCache flag to indicate data source
 * 
 * @param limit - Maximum number of recent jobs to return (default: 5)
 * @returns Object with recentJobs array, loading state, error, cache status, and refresh function
 */
export function useRecentJobs(limit = DEFAULT_LIMIT): UseRecentJobsReturn {
  const [recentJobs, setRecentJobs] = useState<JobOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isUsingCache, setIsUsingCache] = useState(false)

  /**
   * Get recent jobs from cache
   * Returns the first N cached jobs as "recent" when offline
   */
  const getRecentFromCache = useCallback(async (): Promise<JobOrder[]> => {
    const cachedJobs = await getCachedJobOrders()
    return cachedJobs
      .slice(0, limit)
      .map(cachedToJobOrder)
  }, [limit])

  /**
   * Get recent jobs from Supabase
   */
  const getRecentFromSupabase = useCallback(async (): Promise<JobOrder[]> => {
    const supabase = createClient()
    
    // Step 1: Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      throw new Error(userError.message)
    }
    
    if (!user) {
      // No user logged in - return empty array
      return []
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
      return []
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
    return uniqueJobIds
      .map(id => jobs?.find(job => job.id === id))
      .filter((job): job is JobOrder => job !== undefined)
  }, [limit])

  const fetchRecentJobs = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    // Check if device is online
    const isOnline = typeof navigator !== 'undefined' && navigator.onLine

    try {
      let jobs: JobOrder[]
      let usingCache = false

      if (!isOnline) {
        // Offline: use cached jobs
        jobs = await getRecentFromCache()
        usingCache = true
      } else {
        // Online: try Supabase first, fall back to cache on error
        try {
          jobs = await getRecentFromSupabase()
          usingCache = false
        } catch (supabaseError) {
          // Supabase failed, fall back to cache
          console.warn('Supabase fetch failed, using cache:', supabaseError)
          jobs = await getRecentFromCache()
          usingCache = true
        }
      }

      setRecentJobs(jobs)
      setIsUsingCache(usingCache)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Gagal memuat job order terbaru'))
      setRecentJobs([])
      setIsUsingCache(false)
    } finally {
      setIsLoading(false)
    }
  }, [getRecentFromCache, getRecentFromSupabase])

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
    isUsingCache,
    refresh,
  }
}
