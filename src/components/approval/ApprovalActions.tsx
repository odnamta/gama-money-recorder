'use client'

import { useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { approveExpenseApi, rejectExpenseApi } from '@/lib/erp/api-client'

interface ApprovalActionsProps {
  /** Expense ID to approve/reject */
  expenseId: string
  /** Callback after successful action */
  onAction?: () => void
  /** Callback on error */
  onError?: (error: string) => void
  /** Compact mode (smaller buttons) */
  compact?: boolean
}

/**
 * ApprovalActions - Approve/Reject buttons for finance users
 */
export function ApprovalActions({
  expenseId,
  onAction,
  onError,
  compact = false,
}: ApprovalActionsProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      const result = await approveExpenseApi(expenseId)
      if (result.success) {
        onAction?.()
      } else {
        onError?.(result.error || 'Gagal menyetujui')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
      onError?.(message)
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      onError?.('Masukkan alasan penolakan')
      return
    }

    setIsRejecting(true)
    try {
      const result = await rejectExpenseApi(expenseId, rejectReason.trim())
      if (result.success) {
        setShowRejectDialog(false)
        setRejectReason('')
        onAction?.()
      } else {
        onError?.(result.error || 'Gagal menolak')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
      onError?.(message)
    } finally {
      setIsRejecting(false)
    }
  }

  const buttonSize = compact ? 'sm' : 'default'

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => setShowRejectDialog(true)}
          disabled={isApproving || isRejecting}
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          <X className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          {!compact && <span className="ml-1.5">Tolak</span>}
        </Button>
        <Button
          size={buttonSize}
          onClick={handleApprove}
          disabled={isApproving || isRejecting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isApproving ? (
            <Loader2 className={compact ? 'h-3.5 w-3.5 animate-spin' : 'h-4 w-4 animate-spin'} />
          ) : (
            <Check className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          )}
          {!compact && <span className="ml-1.5">{isApproving ? 'Menyetujui...' : 'Setujui'}</span>}
        </Button>
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Pengeluaran</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Alasan Penolakan
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              rows={3}
              placeholder="Masukkan alasan penolakan..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false)
                setRejectReason('')
              }}
              disabled={isRejecting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting || !rejectReason.trim()}
            >
              {isRejecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menolak...
                </>
              ) : (
                'Tolak'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
