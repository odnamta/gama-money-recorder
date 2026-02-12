'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { submitExpenseForApproval } from '@/lib/erp/api-client'
import type { ApprovalStatus } from '@/types/expense-filters'
import type { SyncStatus } from '@/lib/db'

interface SubmitButtonProps {
  /** Expense ID to submit */
  expenseId: string
  /** Current approval status */
  approvalStatus: ApprovalStatus
  /** Current sync status */
  syncStatus: SyncStatus
  /** Callback after successful submission */
  onSubmit?: (bkkNumber?: string) => void
  /** Callback on error */
  onError?: (error: string) => void
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost'
  /** Button size */
  size?: 'default' | 'sm' | 'lg'
  /** Full width button */
  fullWidth?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * SubmitButton - Submit expense for approval
 * 
 * Only enabled when expense is synced and in draft status.
 * Creates BKK record and updates status to pending_approval.
 */
export function SubmitButton({
  expenseId,
  approvalStatus,
  syncStatus,
  onSubmit,
  onError,
  variant = 'default',
  size = 'default',
  fullWidth = false,
  className,
}: SubmitButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Can only submit synced drafts
  const canSubmit = syncStatus === 'synced' && approvalStatus === 'draft'

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return

    setIsSubmitting(true)
    try {
      const result = await submitExpenseForApproval(expenseId)
      
      if (result.success) {
        onSubmit?.(result.bkkNumber)
      } else {
        onError?.(result.error || 'Gagal mengajukan persetujuan')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
      onError?.(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't render if can't submit
  if (!canSubmit) {
    return null
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSubmit}
      disabled={isSubmitting}
      className={fullWidth ? `w-full ${className || ''}` : className}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Mengajukan...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Ajukan Persetujuan
        </>
      )}
    </Button>
  )
}
