/**
 * Example usage of useRecentExpenses hook
 * 
 * This file demonstrates how to use the useRecentExpenses hook
 * in various scenarios.
 */

import { useRecentExpenses } from './use-recent-expenses'
import { ExpenseListItem } from '@/components/history/ExpenseListItem'
import { Button } from '@/components/ui/button'
import { Receipt, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Simple skeleton component for loading state
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
}

/**
 * Example 1: Basic usage with default limit (5 expenses)
 */
export function RecentExpensesBasic() {
  const { recent, isLoading } = useRecentExpenses()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (recent.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Belum ada pengeluaran</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {recent.map((expense) => (
        <ExpenseListItem
          key={expense.id}
          expense={expense}
          onClick={() => {}}
        />
      ))}
    </div>
  )
}

/**
 * Example 2: Custom limit (show only 3 most recent)
 */
export function RecentExpensesCustomLimit() {
  const { recent, isLoading } = useRecentExpenses(3)

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h3 className="font-semibold mb-3">3 Pengeluaran Terakhir</h3>
      {recent.map((expense) => (
        <ExpenseListItem
          key={expense.id}
          expense={expense}
          onClick={() => {}}
        />
      ))}
    </div>
  )
}

/**
 * Example 3: With error handling
 */
export function RecentExpensesWithError() {
  const { recent, isLoading, error } = useRecentExpenses()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 border border-red-200 rounded">
        <p>Gagal memuat pengeluaran: {error.message}</p>
      </div>
    )
  }

  return (
    <div>
      {recent.map((expense) => (
        <ExpenseListItem
          key={expense.id}
          expense={expense}
          onClick={() => {}}
        />
      ))}
    </div>
  )
}

/**
 * Example 4: With refresh functionality
 */
export function RecentExpensesWithRefresh() {
  const { recent, isLoading, refresh } = useRecentExpenses()

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Pengeluaran Terbaru</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>
      {recent.map((expense) => (
        <ExpenseListItem
          key={expense.id}
          expense={expense}
          onClick={refresh}
        />
      ))}
    </div>
  )
}

/**
 * Example 5: Dashboard component (as per design document)
 */
export function RecentExpensesDashboard() {
  const { recent, isLoading } = useRecentExpenses(5)
  const router = useRouter()

  return (
    <div className="bg-white rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Terbaru</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/history')}
        >
          Lihat Semua
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Belum ada pengeluaran</p>
        </div>
      ) : (
        <div className="divide-y">
          {recent.map((expense) => (
            <ExpenseListItem
              key={expense.id}
              expense={expense}
              onClick={() => router.push(`/history?id=${expense.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Example 6: Show count of recent expenses
 */
export function RecentExpensesCount() {
  const { recent, isLoading } = useRecentExpenses(10)

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">
        Menampilkan {recent.length} pengeluaran terakhir
      </p>
      {recent.map((expense) => (
        <ExpenseListItem
          key={expense.id}
          expense={expense}
          onClick={() => {}}
        />
      ))}
    </div>
  )
}
