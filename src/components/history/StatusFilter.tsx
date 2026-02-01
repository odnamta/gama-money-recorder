'use client'

import { Check, Clock, RefreshCw, CheckCircle, AlertCircle, FileText, XCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/cn'
import type { SyncStatus } from '@/lib/db'
import type { ApprovalStatus } from '@/types/expense-filters'

/**
 * Sync status options
 */
const SYNC_STATUS_OPTIONS: Array<{
  value: SyncStatus
  label: string
  Icon: typeof Clock
  color: string
}> = [
  { value: 'pending', label: 'Menunggu', Icon: Clock, color: 'text-yellow-600' },
  { value: 'syncing', label: 'Menyinkron', Icon: RefreshCw, color: 'text-blue-600' },
  { value: 'synced', label: 'Tersinkron', Icon: CheckCircle, color: 'text-green-600' },
  { value: 'failed', label: 'Gagal', Icon: AlertCircle, color: 'text-red-600' },
]

/**
 * Approval status options
 */
const APPROVAL_STATUS_OPTIONS: Array<{
  value: ApprovalStatus
  label: string
  Icon: typeof FileText
  color: string
}> = [
  { value: 'draft', label: 'Draft', Icon: FileText, color: 'text-slate-600' },
  { value: 'pending_approval', label: 'Menunggu Persetujuan', Icon: Clock, color: 'text-yellow-600' },
  { value: 'approved', label: 'Disetujui', Icon: CheckCircle, color: 'text-green-600' },
  { value: 'rejected', label: 'Ditolak', Icon: XCircle, color: 'text-red-600' },
]

interface StatusFilterProps {
  /** Currently selected sync statuses */
  syncStatuses: SyncStatus[]
  /** Currently selected approval statuses */
  approvalStatuses: ApprovalStatus[]
  /** Callback when sync status selection changes */
  onSyncStatusChange: (statuses: SyncStatus[]) => void
  /** Callback when approval status selection changes */
  onApprovalStatusChange: (statuses: ApprovalStatus[]) => void
  /** Additional CSS classes */
  className?: string
}

/**
 * StatusFilter - Filter by sync and approval status
 *
 * Provides multi-select filters for both sync status and approval status.
 */
export function StatusFilter({
  syncStatuses,
  approvalStatuses,
  onSyncStatusChange,
  onApprovalStatusChange,
  className,
}: StatusFilterProps) {
  /**
   * Toggle a sync status selection
   */
  const toggleSyncStatus = (status: SyncStatus) => {
    if (syncStatuses.includes(status)) {
      onSyncStatusChange(syncStatuses.filter((s) => s !== status))
    } else {
      onSyncStatusChange([...syncStatuses, status])
    }
  }

  /**
   * Toggle an approval status selection
   */
  const toggleApprovalStatus = (status: ApprovalStatus) => {
    if (approvalStatuses.includes(status)) {
      onApprovalStatusChange(approvalStatuses.filter((s) => s !== status))
    } else {
      onApprovalStatusChange([...approvalStatuses, status])
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Sync Status */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Status Sinkronisasi</Label>
        <div className="flex flex-wrap gap-2">
          {SYNC_STATUS_OPTIONS.map((option) => {
            const isSelected = syncStatuses.includes(option.value)
            const Icon = option.Icon

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleSyncStatus(option.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors',
                  isSelected
                    ? 'bg-slate-100 border-slate-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <Icon className={cn('h-3.5 w-3.5', option.color)} />
                <span className="text-slate-700">{option.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-slate-600" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Approval Status */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Status Persetujuan</Label>
        <div className="flex flex-wrap gap-2">
          {APPROVAL_STATUS_OPTIONS.map((option) => {
            const isSelected = approvalStatuses.includes(option.value)
            const Icon = option.Icon

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleApprovalStatus(option.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors',
                  isSelected
                    ? 'bg-slate-100 border-slate-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <Icon className={cn('h-3.5 w-3.5', option.color)} />
                <span className="text-slate-700">{option.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-slate-600" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
