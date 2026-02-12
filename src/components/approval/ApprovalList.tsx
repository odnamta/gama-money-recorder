'use client'

import { useState } from 'react'
import { Inbox, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ApprovalItem } from './ApprovalItem'
import { ApprovalDetailSheet } from './ApprovalDetailSheet'
import { usePendingApprovals } from '@/hooks/use-pending-approvals'
import type { DisplayExpense } from '@/types/expense-filters'

interface PendingExpense extends DisplayExpense {
  submitterName?: string
  submitterEmail?: string
}

/**
 * ApprovalList - List of expenses pending approval
 */
export function ApprovalList() {
  const { expenses, isLoading, error, refresh, totalCount } = usePendingApprovals()
  const [selectedExpense, setSelectedExpense] = useState<PendingExpense | null>(null)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleAction = () => {
    setToastMessage({ type: 'success', text: 'Berhasil diproses' })
    refresh()
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleError = (error: string) => {
    setToastMessage({ type: 'error', text: error })
    setTimeout(() => setToastMessage(null), 5000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="outline" onClick={refresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <Inbox className="h-12 w-12 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500">Tidak ada pengeluaran yang perlu disetujui</p>
      </div>
    )
  }

  return (
    <>
      {/* Toast */}
      {toastMessage && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm text-center ${
            toastMessage.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {totalCount} pengeluaran menunggu persetujuan
        </p>
        <Button variant="ghost" size="sm" onClick={refresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* List */}
      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="space-y-3 pb-4">
          {expenses.map((expense) => (
            <ApprovalItem
              key={expense.id}
              expense={expense}
              onClick={() => setSelectedExpense(expense)}
              onAction={handleAction}
              onError={handleError}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Detail Sheet */}
      <ApprovalDetailSheet
        expense={selectedExpense}
        open={!!selectedExpense}
        onOpenChange={(open: boolean) => !open && setSelectedExpense(null)}
        onAction={() => {
          handleAction()
          setSelectedExpense(null)
        }}
        onError={handleError}
      />
    </>
  )
}
