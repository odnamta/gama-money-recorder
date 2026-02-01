'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * GPS coordinates for a location
 */
export interface GPSCoordinates {
  latitude: number
  longitude: number
}

/**
 * Job location data including text-based origin/destination
 * and optional GPS coordinates for future enhancement
 */
export interface JobLocation {
  /** Text-based origin location (e.g., "Jakarta") */
  origin: string
  /** Text-based destination location (e.g., "Bandung") */
  destination: string
  /**
   * GPS coordinates for origin location
   * Currently null - requires job_orders table to have coordinate columns
   * @future Will be populated when origin_latitude/origin_longitude columns are added
   */
  originCoords: GPSCoordinates | null
  /**
   * GPS coordinates for destination location
   * Currently null - requires job_orders table to have coordinate columns
   * @future Will be populated when destination_latitude/destination_longitude columns are added
   */
  destinationCoords: GPSCoordinates | null
}

export interface UseJobLocationReturn {
  /** Job location data, or null if not loaded or no job selected */
  location: JobLocation | null
  /** Whether the location data is currently being fetched */
  isLoading: boolean
  /** Error that occurred during fetch, or null if no error */
  error: Error | null
  /** Function to manually refresh the location data */
  refresh: () => void
  /**
   * Whether GPS validation is available for this job
   * Currently always false since job_orders doesn't have coordinate columns
   * @future Will be true when coordinate columns are added to job_orders
   */
  hasGPSData: boolean
}

/**
 * Hook for fetching job location data (origin/destination)
 * 
 * This hook fetches the origin and destination for a job order.
 * Currently, the job_orders table only has text-based location fields,
 * so GPS validation is not available.
 * 
 * ## Current Limitations
 * - The job_orders table has `origin` and `destination` as TEXT fields
 * - No GPS coordinates are stored in the table
 * - GPS validation (comparing user location to job location) is not possible
 * 
 * ## Future Enhancement
 * When the job_orders table is updated to include coordinate columns:
 * - origin_latitude, origin_longitude
 * - destination_latitude, destination_longitude
 * 
 * This hook will automatically support GPS validation by populating
 * the `originCoords` and `destinationCoords` fields.
 * 
 * @param jobId - The job order ID to fetch location for, or null if no job selected
 * @returns Object with location data, loading state, error, and refresh function
 * 
 * @example
 * ```tsx
 * function ExpenseForm() {
 *   const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
 *   const { location, isLoading, hasGPSData } = useJobLocation(selectedJobId)
 *   
 *   // Display origin/destination text
 *   if (location) {
 *     console.log(`Route: ${location.origin} → ${location.destination}`)
 *   }
 *   
 *   // Check if GPS validation is possible
 *   if (hasGPSData && location?.originCoords) {
 *     // Can perform distance validation
 *   }
 * }
 * ```
 */
export function useJobLocation(jobId: string | null): UseJobLocationReturn {
  const [location, setLocation] = useState<JobLocation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchLocation = useCallback(async () => {
    // If no job ID, clear the location and return
    if (!jobId) {
      setLocation(null)
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Fetch job order with origin and destination
      // Note: Currently only text fields are available
      // Future: Add origin_latitude, origin_longitude, destination_latitude, destination_longitude
      const { data, error: fetchError } = await supabase
        .from('job_orders')
        .select('origin, destination')
        .eq('id', jobId)
        .single()

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      if (!data) {
        throw new Error('Job order tidak ditemukan')
      }

      // Build location object
      // Currently, coordinates are always null since the table doesn't have them
      const jobLocation: JobLocation = {
        origin: data.origin,
        destination: data.destination,
        // GPS coordinates - currently not available in job_orders table
        // These will be populated when coordinate columns are added
        originCoords: null,
        destinationCoords: null,
      }

      setLocation(jobLocation)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Gagal memuat lokasi job'))
      setLocation(null)
    } finally {
      setIsLoading(false)
    }
  }, [jobId])

  // Fetch location when jobId changes
  useEffect(() => {
    fetchLocation()
  }, [fetchLocation])

  // Refresh function to manually refetch
  const refresh = useCallback(() => {
    fetchLocation()
  }, [fetchLocation])

  // GPS data is available only if we have coordinates
  // Currently always false since job_orders doesn't have coordinate columns
  const hasGPSData = Boolean(
    location?.originCoords || location?.destinationCoords
  )

  return {
    location,
    isLoading,
    error,
    refresh,
    hasGPSData,
  }
}

/**
 * Utility function to check if GPS validation can be performed
 * 
 * @param location - The job location data
 * @returns true if at least one set of coordinates is available
 */
export function canValidateGPS(location: JobLocation | null): boolean {
  if (!location) return false
  return Boolean(location.originCoords || location.destinationCoords)
}

/**
 * Get the nearest job location coordinates for GPS validation
 * 
 * This function returns the coordinates that should be used for
 * distance validation. It prefers origin coordinates if available,
 * otherwise falls back to destination coordinates.
 * 
 * @param location - The job location data
 * @returns GPS coordinates or null if none available
 * 
 * @future When coordinates are available, this can be enhanced to:
 * - Return the closest location based on user's current position
 * - Consider both origin and destination for route-based validation
 */
export function getNearestJobCoordinates(
  location: JobLocation | null
): GPSCoordinates | null {
  if (!location) return null
  
  // Prefer origin, fall back to destination
  return location.originCoords || location.destinationCoords
}
