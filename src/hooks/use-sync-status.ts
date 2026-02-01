'use client'

import { useState, useEffect } from 'react'
import { syncManager, type SyncManagerStatus } from '@/lib/db/sync-manager'

/**
 * useSyncStatus - Subscribe to sync manager status updates
 *
 * Returns the current sync status from the SyncManager.
 * Automatically updates when sync status changes.
 *
 * @returns SyncManagerStatus object with status and optional progress/error
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const syncStatus = useSyncStatus()
 *
 *   if (syncStatus.status === 'syncing') {
 *     return <div>Syncing {syncStatus.progress?.current}/{syncStatus.progress?.total}</div>
 *   }
 *
 *   if (syncStatus.status === 'error') {
 *     return <div>Error: {syncStatus.error?.message}</div>
 *   }
 *
 *   return <div>Idle</div>
 * }
 * ```
 */
export function useSyncStatus(): SyncManagerStatus {
  const [status, setStatus] = useState<SyncManagerStatus>({ status: 'idle' })

  useEffect(() => {
    // Subscribe to sync manager status updates
    const unsubscribe = syncManager.subscribe(setStatus)

    return unsubscribe
  }, [])

  return status
}
