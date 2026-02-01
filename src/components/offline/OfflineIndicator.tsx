'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, WifiOff } from 'lucide-react'

import { db } from '@/lib/db'
import { cn } from '@/lib/utils/cn'

/**
 * OfflineIndicator - Shows offline status and pending sync count
 *
 * Displays:
 * - Nothing when online and no pending items
 * - Yellow banner when online but syncing items
 * - Red banner when offline
 *
 * Note: This component uses inline state. In Phase 6, this will be
 * refactored to use useOnlineStatus and usePendingSync hooks.
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

  // Track online/offline status
  useEffect(() => {
    // Set initial state (only in browser)
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine)
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Track pending sync count
  useEffect(() => {
    const updatePendingCount = async () => {
      try {
        const count = await db.syncQueue
          .where('status')
          .anyOf(['pending', 'syncing'])
          .count()
        setPendingCount(count)
      } catch (error) {
        // IndexedDB might not be available (SSR or private browsing)
        console.warn('Failed to get pending sync count:', error)
        setPendingCount(0)
      }
    }

    // Initial count
    updatePendingCount()

    // Poll for changes every 2 seconds
    // Note: In Phase 6, this will be replaced with Dexie hooks for real-time updates
    const interval = setInterval(updatePendingCount, 2000)

    return () => clearInterval(interval)
  }, [])

  // Don't render anything when online and no pending items
  if (isOnline && pendingCount === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 py-1 px-4 text-center text-sm',
        isOnline ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
      )}
      role="status"
      aria-live="polite"
    >
      {isOnline ? (
        <span className="flex items-center justify-center gap-2">
          <RefreshCw className="h-3 w-3 animate-spin" aria-hidden="true" />
          Menyinkronkan {pendingCount} item...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <WifiOff className="h-3 w-3" aria-hidden="true" />
          Mode Offline - Data tersimpan lokal
        </span>
      )}
    </div>
  )
}
