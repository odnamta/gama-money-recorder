'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { ExpenseFilters } from '@/types/expense-filters'

/**
 * Get start of day for a date
 */
function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Get start of week (Monday) for a date
 */
function startOfWeek(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  const diff = result.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday start
  result.setDate(diff)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Get start of month for a date
 */
function startOfMonth(date: Date): Date {
  const result = new Date(date)
  result.setDate(1)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Format date to YYYY-MM-DD
 */
function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Quick filter options
 */
const QUICK_FILTERS = [
  {
    label: 'Hari Ini',
    getValue: () => ({
      from: startOfDay(new Date()),
      to: new Date(),
    }),
  },
  {
    label: 'Minggu Ini',
    getValue: () => ({
      from: startOfWeek(new Date()),
      to: new Date(),
    }),
  },
  {
    label: 'Bulan Ini',
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: new Date(),
    }),
  },
] as const

interface DateRangeFilterProps {
  /** Current filter values */
  value: Pick<ExpenseFilters, 'dateFrom' | 'dateTo'>
  /** Callback when filter values change */
  onChange: (value: Pick<ExpenseFilters, 'dateFrom' | 'dateTo'>) => void
  /** Additional CSS classes */
  className?: string
}

/**
 * DateRangeFilter - Date range filter with quick filter buttons
 *
 * Provides:
 * - Quick filter buttons (Today, This Week, This Month)
 * - Custom date range inputs (from/to)
 */
export function DateRangeFilter({
  value,
  onChange,
  className,
}: DateRangeFilterProps) {
  /**
   * Check if a quick filter is currently active
   */
  const isQuickFilterActive = (filter: (typeof QUICK_FILTERS)[number]): boolean => {
    const { from, to } = filter.getValue()
    return value.dateFrom === toDateString(from) && value.dateTo === toDateString(to)
  }

  /**
   * Handle quick filter click
   */
  const handleQuickFilter = (filter: (typeof QUICK_FILTERS)[number]) => {
    const { from, to } = filter.getValue()
    onChange({
      dateFrom: toDateString(from),
      dateTo: toDateString(to),
    })
  }

  return (
    <div className={cn('space-y-3', className)}>
      <Label className="text-sm font-medium text-slate-700">Periode</Label>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2">
        {QUICK_FILTERS.map((filter) => (
          <Button
            key={filter.label}
            type="button"
            variant={isQuickFilterActive(filter) ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleQuickFilter(filter)}
            className="text-xs"
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Custom range */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="date-from" className="text-xs text-slate-500">
            Dari
          </Label>
          <Input
            id="date-from"
            type="date"
            value={value.dateFrom || ''}
            onChange={(e) =>
              onChange({
                ...value,
                dateFrom: e.target.value || undefined,
              })
            }
            className="text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date-to" className="text-xs text-slate-500">
            Sampai
          </Label>
          <Input
            id="date-to"
            type="date"
            value={value.dateTo || ''}
            onChange={(e) =>
              onChange({
                ...value,
                dateTo: e.target.value || undefined,
              })
            }
            className="text-sm"
          />
        </div>
      </div>
    </div>
  )
}
