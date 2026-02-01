'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCachedJobById } from '@/lib/db/job-cache'
import type { JobOrder } from '@/types/supabase'
import type { CachedJobOrder } from '@/lib/db'

interface UseJobReturn {
  /** The job order data, or null if not found/loading */
  job: JobOrder | null
  /** Whether the job is being loaded */
  isLoading: boolean
  /** Error from the fetch operation */
  error: Error | null
  /** Whether the job is from local cache (offline mode) */
  isUsingCache: boolean
  /** Manually refresh the job data */
  refresh: () => void
}

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
 * Hook for fetching a single job order by ID with offline support
 * 
 * Offline behavior:
 * - When offline, fetches job from IndexedDB cache
 * - When online, prefers Supabase but falls back to cache on error
 * - Returns isUsingCache flag to indicate data source
 * 
 * @param jobId - The job order ID to fetch, or null if no job selected
 * @returns Object with job data, loading state, error, cache status, and refresh function
 */
export function useJob(jobId: string | null): UseJobReturn {
  const [job, setJob] = useState<JobOrder | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isUsingCache, setIsUsingCache] = useState(false)

  /**
   * Get job from cache by ID
   */
  const getJobFromCache = useCallback(async (id: string): Promise<JobOrder | null> => {
    const cachedJob = await getCachedJobById(id)
    return cachedJob ? cachedToJobOrder(cachedJob) : null
  }, [])

  /**
   * Get job from Supabase by ID
   */
  const getJobFromSupabase = useCallback(async (id: string): Promise<JobOrder> => {
    const supabase = createClient()
    
    const { data, error: fetchError } = await supabase
      .from('job_orders')
      .select('id, job_number, customer_name, origin, destination, status')
      .eq('id', id)
      .single()

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    return data
  }, [])

  const fetchJob = useCallback(async () => {
    // If no job ID, clear the job and return
    if (!jobId) {
      setJob(null)
      setIsLoading(false)
      setError(null)
      setIsUsingCache(false)
      return
    }

    setIsLoading(true)
    setError(null)

    // Check if device is online
    const isOnline = typeof navigator !== 'undefined' && navigator.onLine

    try {
      let jobData: JobOrder | null = null
      let usingCache = false

      if (!isOnline) {
        // Offline: use cached job
        jobData = await getJobFromCache(jobId)
        usingCache = true
        
        if (!jobData) {
          throw new Error('Job order tidak ditemukan di cache')
        }
      } else {
        // Online: try Supabase first, fall back to cache on error
        try {
          jobData = await getJobFromSupabase(jobId)
          usingCache = false
        } catch (supabaseError) {
          // Supabase failed, fall back to cache
          console.warn('Supabase fetch failed, using cache:', supabaseError)
          jobData = await getJobFromCache(jobId)
          usingCache = true
          
          if (!jobData) {
            // Re-throw original error if cache also fails
            throw supabaseError
          }
        }
      }

      setJob(jobData)
      setIsUsingCache(usingCache)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Gagal memuat job order'))
      setJob(null)
      setIsUsingCache(false)
    } finally {
      setIsLoading(false)
    }
  }, [jobId, getJobFromCache, getJobFromSupabase])

  // Fetch job when jobId changes
  useEffect(() => {
    fetchJob()
  }, [fetchJob])

  // Refresh function to manually refetch
  const refresh = useCallback(() => {
    fetchJob()
  }, [fetchJob])

  return {
    job,
    isLoading,
    error,
    isUsingCache,
    refresh,
  }
}
