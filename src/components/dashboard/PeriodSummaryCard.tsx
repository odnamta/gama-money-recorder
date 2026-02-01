'use client'

import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/format-currency'

/**
 * Color configuration for period cards
 */
const COLOR_VARIANTS = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    amount: 'text-blue-700',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    amount: 'text-green-700',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    amount: 'text-purple-700',
  },
} as const

export type PeriodColor = keyof typeof COLOR_VARIANTS

interface PeriodSummaryCardProps {
  /** Period title (e.g., "Hari Ini", "Minggu Ini") */
  title: string
  /** Total amount for the period */
  total: number
  /** Number of transactions */
  count: number
  /** Lucide icon component */
  icon: LucideIcon
  /** Color variant for the card */
  color: PeriodColor
  /** Additional CSS classes */
  className?: string
}

/**
 * PeriodSummaryCard - Display summary for a time period
 *
 * Shows:
 * - Period title with icon
 * - Total amount (compact format)
 * - Transaction count
 *
 * Used in dashboard to show today/week/month summaries
 */
export function PeriodSummaryCard({
  title,
  total,
  count,
  icon: Icon,
  color,
  className,
}: PeriodSummaryCardProps) {
  const colors = COLOR_VARIANTS[color]

  return (
    <div className={cn('rounded-lg p-4', colors.bg, className)}>
      {/* Header with icon and title */}
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('h-4 w-4', colors.icon)} />
        <span className="text-sm font-medium text-slate-600">{title}</span>
      </div>

      {/* Amount */}
      <p className={cn('text-xl font-bold', colors.amount)}>
        {formatCurrency(total, { compact: true })}
      </p>

      {/* Transaction count */}
      <p className="text-xs text-slate-500">{count} transaksi</p>
    </div>
  )
}
