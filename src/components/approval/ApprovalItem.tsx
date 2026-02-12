'use client'

import {
  Fuel,
  Route,
  ParkingCircle,
  UtensilsCrossed,
  Bed,
  Car,
  Package,
  MoreHorizontal,
  User,
  Briefcase,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/format-currency'
import { formatDate } from '@/lib/utils/format-date'
import { EXPENSE_CATEGORIES } from '@/constants/expense-categories'
import { ApprovalActions } from './ApprovalActions'
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
  fuel: 'text-orange-500 bg-orange-50',
  toll: 'text-blue-500 bg-blue-50',
  parking: 'text-purple-500 bg-purple-50',
  food: 'text-green-500 bg-green-50',
  lodging: 'text-indigo-500 bg-indigo-50',
  transport: 'text-cyan-500 bg-cyan-50',
  supplies: 'text-amber-500 bg-amber-50',
  other: 'text-gray-500 bg-gray-50',
} as const

interface PendingExpense extends DisplayExpense {
  submitterName?: string
  submitterEmail?: string
}

interface ApprovalItemProps {
  /** The expense to display */
  expense: PendingExpense
  /** Callback when item is clicked */
  onClick?: () => void
  /** Callback after approval action */
  onAction?: () => void
  /** Callback on error */
  onError?: (error: string) => void
}

/**
 * ApprovalItem - Single expense item in approval list
 */
export function ApprovalItem({
  expense,
  onClick,
  onAction,
  onError,
}: ApprovalItemProps) {
  const categoryConfig = EXPENSE_CATEGORIES[expense.category]
  const Icon = CATEGORY_ICONS[expense.category] || MoreHorizontal
  const iconColors = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.other

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
      {/* Header: Amount and Category */}
      <div 
        className="flex items-start justify-between cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', iconColors)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">
              {formatCurrency(expense.amount)}
            </p>
            <p className="text-sm text-slate-500">
              {categoryConfig?.label || expense.category}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">
            {formatDate(expense.expenseDate, 'short')}
          </p>
          {expense.bkkNumber && (
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              {expense.bkkNumber}
            </p>
          )}
        </div>
      </div>

      {/* Submitter Info */}
      <div 
        className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer"
        onClick={onClick}
      >
        <User className="h-4 w-4 text-slate-400" />
        <span>{expense.submitterName || expense.submitterEmail || 'Unknown'}</span>
        {expense.submittedAt && (
          <span className="text-slate-400">
            • {formatDate(expense.submittedAt, 'relative')}
          </span>
        )}
      </div>

      {/* Job Order */}
      {expense.jobOrder && (
        <div 
          className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer"
          onClick={onClick}
        >
          <Briefcase className="h-4 w-4 text-slate-400" />
          <span className="font-medium">{expense.jobOrder.job_number}</span>
          <span className="truncate">{expense.jobOrder.customer_name}</span>
        </div>
      )}

      {/* Description */}
      {expense.description && (
        <p 
          className="text-sm text-slate-600 line-clamp-2 cursor-pointer"
          onClick={onClick}
        >
          {expense.description}
        </p>
      )}

      {/* Actions */}
      <div className="pt-2 border-t border-slate-100 flex justify-end">
        <ApprovalActions
          expenseId={expense.id}
          onAction={onAction}
          onError={onError}
          compact
        />
      </div>
    </div>
  )
}
