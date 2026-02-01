'use client'

import { TrendingUp, Receipt, Fuel, Route, ParkingCircle, UtensilsCrossed, Bed, Car, Package, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/format-currency'
import { Progress } from '@/components/ui/progress'
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/constants/expense-categories'
import type { DisplayExpense } from '@/types/expense-filters'

/**
 * Icon mapping for expense categories
 */
const CATEGORY_ICONS = {
  fuel: Fuel,
  toll: Route,
  parking: ParkingCircle,
  food: UtensilsCrossed,
  lodging: Bed,
  transport: Car,
  supplies: Package,
  other: MoreHorizontal,
} as const

/**
 * Color classes for progress bars
 */
const CATEGORY_PROGRESS_COLORS: Record<ExpenseCategory, string> = {
  fuel: 'bg-orange-500',
  toll: 'bg-blue-500',
  parking: 'bg-purple-500',
  food: 'bg-green-500',
  lodging: 'bg-indigo-500',
  transport: 'bg-cyan-500',
  supplies: 'bg-amber-500',
  other: 'bg-gray-500',
}

/**
 * Group expenses by category and calculate totals
 */
function groupByCategory(
  expenses: DisplayExpense[]
): Record<ExpenseCategory, number> {
  const result: Record<ExpenseCategory, number> = {
    fuel: 0,
    toll: 0,
    parking: 0,
    food: 0,
    lodging: 0,
    transport: 0,
    supplies: 0,
    other: 0,
  }

  for (const expense of expenses) {
    if (expense.category in result) {
      result[expense.category] += expense.amount
    }
  }

  return result
}

/**
 * Count expenses by category
 */
function countByCategory(
  expenses: DisplayExpense[]
): Record<ExpenseCategory, number> {
  const result: Record<ExpenseCategory, number> = {
    fuel: 0,
    toll: 0,
    parking: 0,
    food: 0,
    lodging: 0,
    transport: 0,
    supplies: 0,
    other: 0,
  }

  for (const expense of expenses) {
    if (expense.category in result) {
      result[expense.category]++
    }
  }

  return result
}

interface SummaryCardProps {
  /** Array of expenses to summarize */
  expenses: DisplayExpense[]
  /** Whether data is loading */
  isLoading?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * SummaryCard - Summary statistics for expenses
 *
 * Displays:
 * - Total amount
 * - Transaction count
 * - Category breakdown with progress bars
 */
export function SummaryCard({
  expenses,
  isLoading = false,
  className,
}: SummaryCardProps) {
  // Calculate totals
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const byCategory = groupByCategory(expenses)
  const countsByCategory = countByCategory(expenses)

  // Sort categories by amount (descending)
  const sortedCategories = Object.entries(byCategory)
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4) as [ExpenseCategory, number][]

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('bg-white rounded-2xl border border-slate-100 p-4 animate-pulse', className)}>
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2">
            <div className="h-3 w-12 bg-slate-200 rounded" />
            <div className="h-7 w-28 bg-slate-200 rounded" />
          </div>
          <div className="text-right space-y-2">
            <div className="h-3 w-16 bg-slate-200 rounded ml-auto" />
            <div className="h-5 w-8 bg-slate-200 rounded ml-auto" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-slate-100 rounded" />
                <div className="h-3 w-20 bg-slate-100 rounded" />
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (expenses.length === 0) {
    return (
      <div className={cn('bg-white rounded-2xl border border-slate-100 p-4', className)}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-2xl font-bold text-slate-900">Rp 0</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Transaksi</p>
            <p className="text-lg font-medium text-slate-900">0</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-2xl border border-slate-100 p-4', className)}>
      {/* Header with totals */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            Total
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(total)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500 flex items-center gap-1 justify-end">
            <Receipt className="h-3.5 w-3.5" />
            Transaksi
          </p>
          <p className="text-lg font-medium text-slate-900">{expenses.length}</p>
        </div>
      </div>

      {/* Category breakdown */}
      {sortedCategories.length > 0 && (
        <div className="space-y-3">
          {sortedCategories.map(([category, amount]) => {
            const config = EXPENSE_CATEGORIES[category]
            const Icon = CATEGORY_ICONS[category]
            const percentage = total > 0 ? (amount / total) * 100 : 0
            const count = countsByCategory[category]

            return (
              <div key={category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-slate-700">{config.label}</span>
                    <span className="text-slate-400 text-xs">({count})</span>
                  </div>
                  <span className="text-slate-900 font-medium">
                    {formatCurrency(amount, { compact: true })}
                  </span>
                </div>
                <Progress
                  value={percentage}
                  className="h-1.5"
                  indicatorClassName={CATEGORY_PROGRESS_COLORS[category]}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { groupByCategory, countByCategory }
