'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JobOrder } from '@/types/supabase'

interface UseJobReturn {
  job: JobOrder | null
  isLoading: boolean
  error: Error | null
  refresh: () => void
}

/**
 * Hook for fetching a single job order by ID
 * 
 * @param jobId - The job order ID to fetch, or null if no job selected
 * @returns Object with job data, loading state, error, and refresh function
 */
export function useJob(jobId: string | null): UseJobReturn {
  const [job, setJob] = useState<JobOrder | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchJob = useCallback(async () => {
    // If no job ID, clear the job and return
    if (!jobId) {
      setJob(null)
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      const { data, error: fetchError } = await supabase
        .from('job_orders')
        .select('id, job_number, customer_name, origin, destination, status')
        .eq('id', jobId)
        .single()

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setJob(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Gagal memuat job order'))
      setJob(null)
    } finally {
      setIsLoading(false)
    }
  }, [jobId])

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
    refresh,
  }
}
