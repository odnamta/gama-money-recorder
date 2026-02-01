'use client'

import { Clock, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { SyncStatus } from '@/lib/db'

/**
 * Sync status configuration
 */
const SYNC_STATUS_CONFIG = {
  pending: {
    label: 'Menunggu',
    Icon: Clock,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    animate: false,
  },
  syncing: {
    label: 'Menyinkron...',
    Icon: RefreshCw,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    animate: true,
  },
  synced: {
    label: 'Tersinkron',
    Icon: CheckCircle,
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    animate: false,
  },
  failed: {
    label: 'Gagal',
    Icon: AlertCircle,
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    animate: false,
  },
} as const

interface SyncStatusBadgeProps {
  /** The sync status to display */
  status: SyncStatus
  /** Show only the icon without label */
  compact?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * SyncStatusBadge - Shows sync status for individual items
 *
 * Displays an icon and label indicating the sync status of an expense or receipt.
 * Supports compact mode (icon only) for use in tight spaces.
 */
export function SyncStatusBadge({
  status,
  compact = false,
  className,
}: SyncStatusBadgeProps) {
  const config = SYNC_STATUS_CONFIG[status]
  const { Icon, label, bgColor, textColor, borderColor, animate } = config

  if (compact) {
    return (
      <span
        className={cn(textColor, className)}
        title={label}
        aria-label={label}
      >
        <Icon
          className={cn('h-4 w-4', animate && 'animate-spin')}
          aria-hidden="true"
        />
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        bgColor,
        textColor,
        borderColor,
        className
      )}
    >
      <Icon
        className={cn('h-3 w-3', animate && 'animate-spin')}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
