'use client'

import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { resubmitExpenseApi } from '@/lib/erp/api-client'
import { cn } from '@/lib/utils/cn'
import { formatDate } from '@/lib/utils/format-date'

interface RejectionInfoProps {
  /** Expense ID for resubmit action */
  expenseId: string
  /** Rejection reason */
  reason: string
  /** When rejected */
  rejectedAt?: string
  /** Who rejected */
  rejectedBy?: string
  /** Allow resubmit action */
  allowResubmit?: boolean
  /** Callback after successful resubmit */
  onResubmit?: (bkkNumber?: string) => void
  /** Callback on error */
  onError?: (error: string) => void
  /** Additional CSS classes */
  className?: string
}

/**
 * RejectionInfo - Displays rejection details with optional resubmit action
 * 
 * Shows the rejection reason, timestamp, and who rejected.
 * Optionally allows resubmitting the expense after corrections.
 */
export function RejectionInfo({
  expenseId,
  reason,
  rejectedAt,
  rejectedBy,
  allowResubmit = true,
  onResubmit,
  onError,
  className,
}: RejectionInfoProps) {
  const [isResubmitting, setIsResubmitting] = useState(false)

  const handleResubmit = async () => {
    if (isResubmitting) return

    setIsResubmitting(true)
    try {
      const result = await resubmitExpenseApi(expenseId)
      
      if (result.success) {
        onResubmit?.(result.bkkNumber)
      } else {
        onError?.(result.error || 'Gagal mengajukan ulang')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
      onError?.(message)
    } finally {
      setIsResubmitting(false)
    }
  }

  return (
    <div className={cn('rounded-lg border border-red-200 bg-red-50 p-3', className)}>
      <div className="flex gap-2">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-800">Pengeluaran Ditolak</p>
          <p className="mt-1 text-sm text-red-700">{reason}</p>
          
          {(rejectedAt || rejectedBy) && (
            <p className="mt-2 text-xs text-red-500">
              {rejectedAt && formatDate(rejectedAt, 'medium')}
              {rejectedAt && rejectedBy && ' • '}
              {rejectedBy && `oleh ${rejectedBy}`}
            </p>
          )}

          {allowResubmit && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResubmit}
              disabled={isResubmitting}
              className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
            >
              {isResubmitting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Mengajukan...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                  Ajukan Ulang
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
