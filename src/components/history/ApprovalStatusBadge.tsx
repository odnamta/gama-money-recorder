'use client'

import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { ApprovalStatus } from '@/types/expense-filters'

/**
 * Approval status configuration
 */
const APPROVAL_STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    Icon: FileText,
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
    borderColor: 'border-slate-200',
  },
  pending_approval: {
    label: 'Menunggu',
    Icon: Clock,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
  },
  approved: {
    label: 'Disetujui',
    Icon: CheckCircle,
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  rejected: {
    label: 'Ditolak',
    Icon: XCircle,
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
} as const

interface ApprovalStatusBadgeProps {
  /** The approval status to display */
  status: ApprovalStatus
  /** Show only the icon without label */
  compact?: boolean
  /** Show full label with icon */
  showLabel?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * ApprovalStatusBadge - Shows approval status for expenses
 *
 * Displays an icon and label indicating the approval status of an expense.
 * Supports compact mode (icon only) for use in tight spaces.
 */
export function ApprovalStatusBadge({
  status,
  compact = false,
  showLabel = false,
  className,
}: ApprovalStatusBadgeProps) {
  const config = APPROVAL_STATUS_CONFIG[status]
  const { Icon, label, bgColor, textColor, borderColor } = config

  // Compact mode - just the icon
  if (compact) {
    return (
      <span
        className={cn(textColor, className)}
        title={label}
        aria-label={label}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    )
  }

  // Full badge with label
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
      <Icon className="h-3 w-3" aria-hidden="true" />
      {showLabel !== false && label}
    </span>
  )
}
