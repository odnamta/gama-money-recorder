'use client'

import { Receipt, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRecentExpenses } from '@/hooks/use-recent-expenses'
import { ExpenseListItem } from '@/components/history/ExpenseListItem'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * RecentExpenses - Display the most recent expenses on the dashboard
 *
 * Shows the last 5 expenses with:
 * - Loading skeletons while fetching
 * - Empty state when no expenses exist
 * - ExpenseListItem for each expense
 * - "Lihat Semua" button to navigate to full history
 *
 * @example
 * ```tsx
 * <RecentExpenses />
 * ```
 */
export function RecentExpenses() {
  const { recent, isLoading } = useRecentExpenses(5)
  const router = useRouter()

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">Terbaru</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/history')}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          Lihat Semua
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        // Loading skeletons
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      ) : recent.length === 0 ? (
        // Empty state
        <div className="p-8 text-center">
          <Receipt className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium mb-1">Belum ada pengeluaran</p>
          <p className="text-sm text-slate-400">
            Mulai catat pengeluaran Anda
          </p>
        </div>
      ) : (
        // Expense list
        <div className="divide-y divide-slate-100">
          {recent.map((expense) => (
            <div key={expense.id} className="px-3 py-2">
              <ExpenseListItem
                expense={expense}
                onClick={() => router.push(`/history?id=${expense.id}`)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
