'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { syncManager } from '@/lib/db/sync-manager'
import { cn } from '@/lib/utils/cn'

interface ManualSyncButtonProps {
  /** Additional CSS classes */
  className?: string
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost'
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

/**
 * ManualSyncButton - Triggers manual sync of pending items
 *
 * Allows users to manually trigger sync without waiting for automatic sync.
 * Shows loading state while sync is in progress.
 */
export function ManualSyncButton({
  className,
  variant = 'outline',
  size = 'default',
}: ManualSyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    if (isSyncing) return

    // Check if online
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return
    }

    setIsSyncing(true)
    try {
      await syncManager.triggerSync()
    } catch (error) {
      console.error('Manual sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleSync}
      disabled={isSyncing || !isOnline}
      className={cn(className)}
    >
      <RefreshCw
        className={cn('h-4 w-4', isSyncing && 'animate-spin')}
        aria-hidden="true"
      />
      {size !== 'icon' && (
        <span className="ml-2">
          {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan'}
        </span>
      )}
    </Button>
  )
}
