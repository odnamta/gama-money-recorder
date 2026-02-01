'use client'

import { useEffect, useRef, useCallback } from 'react'
import { isJobCacheStale, refreshJobCache } from '@/lib/db/job-cache'
import { logger } from '@/lib/logger'

/**
 * JobCacheInitializer
 *
 * A client component that initializes the job cache when the authenticated app loads.
 * It checks if the cache is stale and refreshes it if online.
 * It also listens for 'online' events to refresh the cache when connectivity is restored.
 *
 * This component is invisible and only handles cache logic.
 * It should be placed in the auth layout to run when the user is authenticated.
 */
export function JobCacheInitializer({
  children,
}: {
  children: React.ReactNode
}) {
  const hasInitialized = useRef(false)

  /**
   * Refresh the job cache
   * Used both on initial mount and when coming back online
   */
  const refreshCache = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return
      if (!navigator.onLine) {
        logger.info('JobCacheInitializer: Offline, skipping cache refresh')
        return
      }

      const stale = await isJobCacheStale()

      if (stale) {
        logger.info('JobCacheInitializer: Cache is stale, refreshing...')
        const success = await refreshJobCache()
        if (success) {
          logger.info('JobCacheInitializer: Cache refreshed successfully')
        } else {
          logger.warn('JobCacheInitializer: Cache refresh returned false')
        }
      } else {
        logger.info('JobCacheInitializer: Cache is fresh, no refresh needed')
      }
    } catch (error) {
      logger.error(
        'JobCacheInitializer: Failed to initialize cache',
        error instanceof Error ? error : new Error(String(error))
      )
    }
  }, [])

  /**
   * Handle online event - refresh cache when device comes back online
   */
  const handleOnline = useCallback(() => {
    logger.info('JobCacheInitializer: Device came online, refreshing cache...')
    refreshCache()
  }, [refreshCache])

  // Initialize cache on mount
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true
    refreshCache()
  }, [refreshCache])

  // Listen for online events to refresh cache when connectivity is restored
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [handleOnline])

  return <>{children}</>
}
