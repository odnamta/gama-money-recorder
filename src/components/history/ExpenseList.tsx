'use client'

import { ExpenseListItem } from './ExpenseListItem'
import { ExpenseListEmpty } from './ExpenseListEmpty'
import { ExpenseListSkeleton } from './ExpenseListSkeleton'
import type { DisplayExpense } from '@/types/expense-filters'

interface ExpenseListProps {
  /** Array of expenses to display */
  expenses: DisplayExpense[]
  /** Whether the list is loading */
  isLoading: boolean
  /** Click handler for expense items */
  onExpenseClick: (expense: DisplayExpense) => void
  /** Optional search term to highlight */
  searchTerm?: string
  /** Whether filters are active */
  hasFilters?: boolean
}

/**
 * ExpenseList - Container for expense list items
 *
 * Handles loading, empty, and populated states for the expense list.
 */
export function ExpenseList({
  expenses,
  isLoading,
  onExpenseClick,
  searchTerm,
  hasFilters = false,
}: ExpenseListProps) {
  // Loading state
  if (isLoading) {
    return <ExpenseListSkeleton />
  }

  // Empty state
  if (expenses.length === 0) {
    return <ExpenseListEmpty hasFilters={hasFilters} />
  }

  // Populated list
  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <ExpenseListItem
          key={expense.id}
          expense={expense}
          onClick={() => onExpenseClick(expense)}
          searchTerm={searchTerm}
        />
      ))}
    </div>
  )
}
