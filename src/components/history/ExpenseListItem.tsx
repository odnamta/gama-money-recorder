'use client'

import { ChevronRight, Fuel, Route, ParkingCircle, UtensilsCrossed, Bed, Car, Package, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/format-currency'
import { formatDate } from '@/lib/utils/format-date'
import { EXPENSE_CATEGORIES } from '@/constants/expense-categories'
import { SyncStatusBadge } from '@/components/offline/SyncStatusBadge'
import { ApprovalStatusBadge } from './ApprovalStatusBadge'
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
 * Color classes for category icons
 */
const CATEGORY_COLORS = {
  fuel: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
  },
  toll: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
  },
  parking: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
  },
  food: {
    bg: 'bg-green-100',
    text: 'text-green-600',
  },
  lodging: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
  },
  transport: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-600',
  },
  supplies: {
    bg: 'bg-amber-100',
    text: 'text-amber-600',
  },
  other: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
  },
} as const

interface ExpenseListItemProps {
  /** The expense to display */
  expense: DisplayExpense
  /** Click handler for opening detail view */
  onClick: () => void
  /** Optional search term to highlight */
  searchTerm?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Highlight matching text in a string
 */
function highlightText(text: string, searchTerm?: string): React.ReactNode {
  if (!searchTerm || !searchTerm.trim()) {
    return text
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

/**
 * ExpenseListItem - Individual expense item in the history list
 *
 * Displays expense information including:
 * - Category icon with color
 * - Vendor name or category label
 * - Date and job order number
 * - Amount
 * - Sync and approval status badges
 */
export function ExpenseListItem({
  expense,
  onClick,
  searchTerm,
  className,
}: ExpenseListItemProps) {
  const categoryConfig = EXPENSE_CATEGORIES[expense.category]
  const Icon = CATEGORY_ICONS[expense.category] || MoreHorizontal
  const colors = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.other

  const displayName = expense.vendorName || categoryConfig?.label || expense.category

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 hover:bg-slate-50 active:bg-slate-100 rounded-xl transition-colors text-left',
        'bg-white border border-slate-100',
        className
      )}
    >
      {/* Category Icon */}
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
          colors.bg
        )}
      >
        <Icon className={cn('h-5 w-5', colors.text)} />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900 truncate">
            {highlightText(displayName, searchTerm)}
          </span>
          <SyncStatusBadge status={expense.syncStatus} compact />
        </div>
        <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
          <span>{formatDate(expense.expenseDate, 'medium')}</span>
          {expense.jobOrder && (
            <>
              <span>•</span>
              <span className="truncate">{expense.jobOrder.job_number}</span>
            </>
          )}
          {expense.isOverhead && !expense.jobOrder && (
            <>
              <span>•</span>
              <span className="text-slate-400">Overhead</span>
            </>
          )}
        </div>
        {expense.description && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {highlightText(expense.description, searchTerm)}
          </p>
        )}
      </div>

      {/* Amount & Status */}
      <div className="text-right flex-shrink-0">
        <div className="font-semibold text-slate-900">
          {formatCurrency(expense.amount)}
        </div>
        <ApprovalStatusBadge status={expense.approvalStatus} compact />
      </div>

      {/* Chevron */}
      <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
    </button>
  )
}
