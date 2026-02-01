'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JobOrder } from '@/types/supabase'

interface UseJobSearchReturn {
  jobs: JobOrder[]
  isLoading: boolean
  error: Error | null
  search: (term: string) => void
  clearResults: () => void
}

const DEBOUNCE_MS = 300
const MIN_SEARCH_LENGTH = 2
const MAX_RESULTS = 20

/**
 * Hook for searching job orders with debounce
 * 
 * Searches job_orders table by job_number and customer_name
 * Only returns active jobs (status = 'active')
 * 
 * @param initialSearchTerm - Optional initial search term
 * @returns Object with jobs array, loading state, error, and search function
 */
export function useJobSearch(initialSearchTerm = ''): UseJobSearchReturn {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [jobs, setJobs] = useState<JobOrder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // Ref to track the latest search term for debounce
  const searchTermRef = useRef(searchTerm)
  searchTermRef.current = searchTerm

  const performSearch = useCallback(async (term: string) => {
    // Don't search if term is too short
    if (term.length < MIN_SEARCH_LENGTH) {
      setJobs([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Search by job_number or customer_name (case-insensitive)
      const { data, error: queryError } = await supabase
        .from('job_orders')
        .select('id, job_number, customer_name, origin, destination, status')
        .eq('status', 'active')
        .or(`job_number.ilike.%${term}%,customer_name.ilike.%${term}%`)
        .order('job_number', { ascending: false })
        .limit(MAX_RESULTS)

      if (queryError) {
        throw new Error(queryError.message)
      }

      // Only update if this is still the current search term
      if (searchTermRef.current === term) {
        setJobs(data || [])
      }
    } catch (err) {
      // Only update error if this is still the current search term
      if (searchTermRef.current === term) {
        setError(err instanceof Error ? err : new Error('Gagal mencari job order'))
      }
    } finally {
      // Only update loading if this is still the current search term
      if (searchTermRef.current === term) {
        setIsLoading(false)
      }
    }
  }, [])

  // Debounced search effect
  useEffect(() => {
    // Clear results immediately if search term is too short
    if (searchTerm.length < MIN_SEARCH_LENGTH) {
      setJobs([])
      setIsLoading(false)
      return
    }

    // Set loading state immediately for better UX
    setIsLoading(true)

    // Debounce the actual search
    const debounceTimer = setTimeout(() => {
      performSearch(searchTerm)
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(debounceTimer)
    }
  }, [searchTerm, performSearch])

  const search = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  const clearResults = useCallback(() => {
    setSearchTerm('')
    setJobs([])
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    jobs,
    isLoading,
    error,
    search,
    clearResults,
  }
}
