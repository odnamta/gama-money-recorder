'use client'

import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatDate } from '@/lib/utils/format-date'
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

/**
 * Approval details for tooltip/extended display
 */
export interface ApprovalDetails {
  /** BKK number if assigned */
  bkkNumber?: string
  /** When submitted for approval */
  submittedAt?: string
  /** Who submitted */
  submittedBy?: string
  /** When approved/rejected */
  approvedAt?: string
  /** Who approved/rejected */
  approvedBy?: string
  /** Rejection reason if rejected */
  rejectionReason?: string
}

interface ApprovalStatusBadgeProps {
  /** The approval status to display */
  status: ApprovalStatus
  /** Show only the icon without label */
  compact?: boolean
  /** Show full label with icon */
  showLabel?: boolean
  /** Additional approval details for tooltip */
  details?: ApprovalDetails
  /** Show extended info below badge */
  showDetails?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * ApprovalStatusBadge - Shows approval status for expenses
 *
 * Displays an icon and label indicating the approval status of an expense.
 * Supports compact mode (icon only) for use in tight spaces.
 * Can show extended details including BKK number, approver, and timestamps.
 */
export function ApprovalStatusBadge({
  status,
  compact = false,
  showLabel = false,
  details,
  showDetails = false,
  className,
}: ApprovalStatusBadgeProps) {
  const config = APPROVAL_STATUS_CONFIG[status]
  const { Icon, label, bgColor, textColor, borderColor } = config

  // Build tooltip text
  const buildTooltip = (): string => {
    const parts: string[] = [label]
    
    if (details?.bkkNumber) {
      parts.push(`No: ${details.bkkNumber}`)
    }
    
    if (status === 'pending_approval' && details?.submittedAt) {
      parts.push(`Diajukan: ${formatDate(details.submittedAt, 'medium')}`)
    }
    
    if ((status === 'approved' || status === 'rejected') && details?.approvedAt) {
      const action = status === 'approved' ? 'Disetujui' : 'Ditolak'
      parts.push(`${action}: ${formatDate(details.approvedAt, 'medium')}`)
    }
    
    if (details?.approvedBy) {
      parts.push(`Oleh: ${details.approvedBy}`)
    }
    
    if (status === 'rejected' && details?.rejectionReason) {
      parts.push(`Alasan: ${details.rejectionReason}`)
    }
    
    return parts.join('\n')
  }

  const tooltip = details ? buildTooltip() : label

  // Compact mode - just the icon
  if (compact) {
    return (
      <span
        className={cn(textColor, className)}
        title={tooltip}
        aria-label={label}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    )
  }

  // Full badge with optional extended details
  return (
    <div className={cn('inline-flex flex-col', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
          bgColor,
          textColor,
          borderColor
        )}
        title={!showDetails ? tooltip : undefined}
      >
        <Icon className="h-3 w-3" aria-hidden="true" />
        {showLabel !== false && label}
      </span>
      
      {/* Extended details section */}
      {showDetails && details && (
        <div className="mt-1 text-xs text-slate-500 space-y-0.5">
          {details.bkkNumber && (
            <p className="font-mono">{details.bkkNumber}</p>
          )}
          
          {status === 'pending_approval' && details.submittedAt && (
            <p>Diajukan {formatDate(details.submittedAt, 'relative')}</p>
          )}
          
          {(status === 'approved' || status === 'rejected') && (
            <>
              {details.approvedAt && (
                <p>
                  {status === 'approved' ? 'Disetujui' : 'Ditolak'}{' '}
                  {formatDate(details.approvedAt, 'relative')}
                </p>
              )}
              {details.approvedBy && (
                <p className="text-slate-400">oleh {details.approvedBy}</p>
              )}
            </>
          )}
          
          {status === 'rejected' && details.rejectionReason && (
            <div className="mt-1 p-2 bg-red-50 rounded text-red-600 flex gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>{details.rejectionReason}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
