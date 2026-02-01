'use client'

import { Check, Fuel, Route, ParkingCircle, UtensilsCrossed, Bed, Car, Package, MoreHorizontal } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/cn'
import { EXPENSE_CATEGORY_LIST, type ExpenseCategory } from '@/constants/expense-categories'

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
 * Color classes for category items
 */
const CATEGORY_COLORS = {
  fuel: {
    bg: 'bg-orange-50',
    bgSelected: 'bg-orange-100',
    border: 'border-orange-200',
    borderSelected: 'border-orange-400',
    text: 'text-orange-700',
  },
  toll: {
    bg: 'bg-blue-50',
    bgSelected: 'bg-blue-100',
    border: 'border-blue-200',
    borderSelected: 'border-blue-400',
    text: 'text-blue-700',
  },
  parking: {
    bg: 'bg-purple-50',
    bgSelected: 'bg-purple-100',
    border: 'border-purple-200',
    borderSelected: 'border-purple-400',
    text: 'text-purple-700',
  },
  food: {
    bg: 'bg-green-50',
    bgSelected: 'bg-green-100',
    border: 'border-green-200',
    borderSelected: 'border-green-400',
    text: 'text-green-700',
  },
  lodging: {
    bg: 'bg-indigo-50',
    bgSelected: 'bg-indigo-100',
    border: 'border-indigo-200',
    borderSelected: 'border-indigo-400',
    text: 'text-indigo-700',
  },
  transport: {
    bg: 'bg-cyan-50',
    bgSelected: 'bg-cyan-100',
    border: 'border-cyan-200',
    borderSelected: 'border-cyan-400',
    text: 'text-cyan-700',
  },
  supplies: {
    bg: 'bg-amber-50',
    bgSelected: 'bg-amber-100',
    border: 'border-amber-200',
    borderSelected: 'border-amber-400',
    text: 'text-amber-700',
  },
  other: {
    bg: 'bg-gray-50',
    bgSelected: 'bg-gray-100',
    border: 'border-gray-200',
    borderSelected: 'border-gray-400',
    text: 'text-gray-700',
  },
} as const

interface CategoryFilterProps {
  /** Currently selected categories */
  selected: ExpenseCategory[]
  /** Callback when selection changes */
  onChange: (categories: ExpenseCategory[]) => void
  /** Optional counts per category */
  counts?: Record<ExpenseCategory, number>
  /** Additional CSS classes */
  className?: string
}

/**
 * CategoryFilter - Multi-select category filter
 *
 * Displays all expense categories as toggleable buttons.
 * Supports showing counts per category.
 */
export function CategoryFilter({
  selected,
  onChange,
  counts,
  className,
}: CategoryFilterProps) {
  /**
   * Toggle a category selection
   */
  const toggleCategory = (category: ExpenseCategory) => {
    if (selected.includes(category)) {
      onChange(selected.filter((c) => c !== category))
    } else {
      onChange([...selected, category])
    }
  }

  /**
   * Select all categories
   */
  const selectAll = () => {
    onChange(EXPENSE_CATEGORY_LIST.map((c) => c.value))
  }

  /**
   * Clear all selections
   */
  const clearAll = () => {
    onChange([])
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-slate-700">Kategori</Label>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Hapus
            </button>
          )}
          {selected.length < EXPENSE_CATEGORY_LIST.length && (
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Pilih Semua
            </button>
          )}
        </div>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-2 gap-2">
        {EXPENSE_CATEGORY_LIST.map((category) => {
          const isSelected = selected.includes(category.value)
          const Icon = CATEGORY_ICONS[category.value]
          const colors = CATEGORY_COLORS[category.value]
          const count = counts?.[category.value]

          return (
            <button
              key={category.value}
              type="button"
              onClick={() => toggleCategory(category.value)}
              className={cn(
                'flex items-center gap-2 p-2.5 rounded-lg border transition-colors text-left',
                isSelected
                  ? [colors.bgSelected, colors.borderSelected]
                  : [colors.bg, colors.border, 'hover:border-slate-300']
              )}
            >
              <Icon className={cn('h-4 w-4 flex-shrink-0', colors.text)} />
              <span className={cn('text-sm flex-1', colors.text)}>
                {category.label}
              </span>
              {count !== undefined && (
                <span className="text-xs text-slate-500">{count}</span>
              )}
              {isSelected && (
                <Check className={cn('h-4 w-4 flex-shrink-0', colors.text)} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
