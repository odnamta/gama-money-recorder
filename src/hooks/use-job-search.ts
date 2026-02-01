'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { searchCachedJobs, getCachedJobOrders } from '@/lib/db/job-cache'
import type { JobOrder } from '@/types/supabase'
import type { CachedJobOrder } from '@/lib/db'

interface UseJobSearchReturn {
  /** Array of job orders matching the search */
  jobs: JobOrder[]
  /** Whether a search is in progress */
  isLoading: boolean
  /** Error from the search operation */
  error: Error | null
  /** Whether results are from local cache (offline mode) */
  isUsingCache: boolean
  /** Trigger a search with the given term */
  search: (term: string) => void
  /** Clear all search results */
  clearResults: () => void
}

const DEBOUNCE_MS = 300
const MIN_SEARCH_LENGTH = 2
const MAX_RESULTS = 20

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
 * Hook for searching job orders with debounce and offline support
 * 
 * Searches job_orders table by job_number and customer_name
 * Only returns active jobs (status = 'active')
 * 
 * Offline behavior:
 * - When offline, searches cached jobs from IndexedDB
 * - When online, prefers Supabase but falls back to cache on error
 * - Returns isUsingCache flag to indicate data source
 * 
 * @param initialSearchTerm - Optional initial search term
 * @returns Object with jobs array, loading state, error, cache status, and search function
 */
export function useJobSearch(initialSearchTerm = ''): UseJobSearchReturn {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [jobs, setJobs] = useState<JobOrder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isUsingCache, setIsUsingCache] = useState(false)
  
  // Ref to track the latest search term for debounce
  const searchTermRef = useRef(searchTerm)
  searchTermRef.current = searchTerm

  /**
   * Search cached jobs from IndexedDB
   */
  const searchFromCache = useCallback(async (term: string): Promise<JobOrder[]> => {
    const cachedJobs = term.length >= MIN_SEARCH_LENGTH
      ? await searchCachedJobs(term)
      : await getCachedJobOrders()
    
    return cachedJobs
      .map(cachedToJobOrder)
      .slice(0, MAX_RESULTS)
  }, [])

  /**
   * Search jobs from Supabase
   */
  const searchFromSupabase = useCallback(async (term: string): Promise<JobOrder[]> => {
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

    return data || []
  }, [])

  const performSearch = useCallback(async (term: string) => {
    // Don't search if term is too short
    if (term.length < MIN_SEARCH_LENGTH) {
      setJobs([])
      setIsLoading(false)
      setIsUsingCache(false)
      return
    }

    setIsLoading(true)
    setError(null)

    // Check if device is online
    const isOnline = typeof navigator !== 'undefined' && navigator.onLine

    try {
      let results: JobOrder[]
      let usingCache = false

      if (!isOnline) {
        // Offline: use cached jobs
        results = await searchFromCache(term)
        usingCache = true
      } else {
        // Online: try Supabase first, fall back to cache on error
        try {
          results = await searchFromSupabase(term)
          usingCache = false
        } catch (supabaseError) {
          // Supabase failed, fall back to cache
          console.warn('Supabase search failed, using cache:', supabaseError)
          results = await searchFromCache(term)
          usingCache = true
        }
      }

      // Only update if this is still the current search term
      if (searchTermRef.current === term) {
        setJobs(results)
        setIsUsingCache(usingCache)
      }
    } catch (err) {
      // Only update error if this is still the current search term
      if (searchTermRef.current === term) {
        setError(err instanceof Error ? err : new Error('Gagal mencari job order'))
        setIsUsingCache(false)
      }
    } finally {
      // Only update loading if this is still the current search term
      if (searchTermRef.current === term) {
        setIsLoading(false)
      }
    }
  }, [searchFromCache, searchFromSupabase])

  // Debounced search effect
  useEffect(() => {
    // Clear results immediately if search term is too short
    if (searchTerm.length < MIN_SEARCH_LENGTH) {
      setJobs([])
      setIsLoading(false)
      setIsUsingCache(false)
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
    setIsUsingCache(false)
  }, [])

  return {
    jobs,
    isLoading,
    error,
    isUsingCache,
    search,
    clearResults,
  }
}
