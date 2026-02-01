'use client'

import { useState, useEffect } from 'react'

/**
 * useOnlineStatus - Track device online/offline status
 *
 * Returns true when the device is online, false when offline.
 * Automatically updates when connectivity changes.
 *
 * @returns boolean indicating online status
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isOnline = useOnlineStatus()
 *
 *   return (
 *     <div>
 *       {isOnline ? 'Online' : 'Offline'}
 *     </div>
 *   )
 * }
 * ```
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true)

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

  return isOnline
}
