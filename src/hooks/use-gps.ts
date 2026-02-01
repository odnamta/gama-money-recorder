'use client'

import { useState, useCallback } from 'react'

/**
 * GPS position data captured from the browser's Geolocation API
 */
export interface GPSPosition {
  /** Latitude in decimal degrees */
  latitude: number
  /** Longitude in decimal degrees */
  longitude: number
  /** Accuracy of the position in meters */
  accuracy: number
}

/**
 * Return type for the useGPS hook
 */
export interface UseGPSReturn {
  /** Current GPS position, or null if not captured */
  position: GPSPosition | null
  /** Error message in Indonesian, or null if no error */
  error: string | null
  /** Whether GPS capture is in progress */
  isLoading: boolean
  /** Function to trigger GPS capture */
  capturePosition: () => Promise<GPSPosition | null>
}

/**
 * Geolocation options for high accuracy GPS capture
 */
const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000, // 10 seconds
  maximumAge: 60000, // 1 minute
}

/**
 * Indonesian error messages for GPS errors
 */
const GPS_ERROR_MESSAGES: Record<number, string> = {
  1: 'Izin lokasi ditolak', // PERMISSION_DENIED
  2: 'Lokasi tidak tersedia', // POSITION_UNAVAILABLE
  3: 'Waktu habis mendapatkan lokasi', // TIMEOUT
}

/**
 * Get Indonesian error message for GeolocationPositionError
 */
function getGPSErrorMessage(error: GeolocationPositionError): string {
  return GPS_ERROR_MESSAGES[error.code] || 'Gagal mendapatkan lokasi'
}

/**
 * Hook for capturing GPS coordinates using the browser's Geolocation API
 * 
 * Features:
 * - High accuracy mode with 10 second timeout
 * - Indonesian error messages
 * - Handles GPS permission errors gracefully
 * - Returns position, error state, and loading state
 * 
 * @example
 * ```tsx
 * const { position, error, isLoading, capturePosition } = useGPS()
 * 
 * // Capture position on button click
 * const handleCapture = async () => {
 *   const pos = await capturePosition()
 *   if (pos) {
 *     console.log(`Lat: ${pos.latitude}, Lng: ${pos.longitude}`)
 *   }
 * }
 * ```
 * 
 * @returns Object with position, error, isLoading, and capturePosition function
 */
export function useGPS(): UseGPSReturn {
  const [position, setPosition] = useState<GPSPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const capturePosition = useCallback(async (): Promise<GPSPosition | null> => {
    // Check if geolocation is available in the browser
    if (!navigator.geolocation) {
      setError('GPS tidak tersedia')
      return null
    }

    setIsLoading(true)
    setError(null)

    return new Promise<GPSPosition | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        // Success callback
        (pos) => {
          const capturedPosition: GPSPosition = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }
          setPosition(capturedPosition)
          setIsLoading(false)
          resolve(capturedPosition)
        },
        // Error callback
        (err) => {
          const errorMessage = getGPSErrorMessage(err)
          setError(errorMessage)
          setIsLoading(false)
          resolve(null)
        },
        // Options
        GEOLOCATION_OPTIONS
      )
    })
  }, [])

  return {
    position,
    error,
    isLoading,
    capturePosition,
  }
}
