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
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import {
  type ExpenseCategory,
  EXPENSE_CATEGORY_LIST,
} from '@/constants/expense-categories'

const ICONS: Record<string, LucideIcon> = {
  Fuel,
  Route,
  ParkingCircle,
  UtensilsCrossed,
  Bed,
  Car,
  Package,
  MoreHorizontal,
}

const COLOR_CLASSES: Record<string, { bg: string; bgSelected: string; text: string; border: string }> = {
  orange: {
    bg: 'bg-orange-50',
    bgSelected: 'bg-orange-100',
    text: 'text-orange-600',
    border: 'border-orange-500',
  },
  blue: {
    bg: 'bg-blue-50',
    bgSelected: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-500',
  },
  purple: {
    bg: 'bg-purple-50',
    bgSelected: 'bg-purple-100',
    text: 'text-purple-600',
    border: 'border-purple-500',
  },
  green: {
    bg: 'bg-green-50',
    bgSelected: 'bg-green-100',
    text: 'text-green-600',
    border: 'border-green-500',
  },
  indigo: {
    bg: 'bg-indigo-50',
    bgSelected: 'bg-indigo-100',
    text: 'text-indigo-600',
    border: 'border-indigo-500',
  },
  cyan: {
    bg: 'bg-cyan-50',
    bgSelected: 'bg-cyan-100',
    text: 'text-cyan-600',
    border: 'border-cyan-500',
  },
  amber: {
    bg: 'bg-amber-50',
    bgSelected: 'bg-amber-100',
    text: 'text-amber-600',
    border: 'border-amber-500',
  },
  gray: {
    bg: 'bg-gray-50',
    bgSelected: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-500',
  },
}

interface CategorySelectorProps {
  value: ExpenseCategory | null
  onChange: (category: ExpenseCategory) => void
  error?: string
  disabled?: boolean
}

export function CategorySelector({
  value,
  onChange,
  error,
  disabled = false,
}: CategorySelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Kategori</label>
      <div
        className="grid grid-cols-4 gap-2"
        role="radiogroup"
        aria-label="Pilih kategori pengeluaran"
        aria-invalid={!!error}
        aria-describedby={error ? 'category-error' : undefined}
      >
        {EXPENSE_CATEGORY_LIST.map((category) => {
          const Icon = ICONS[category.icon]
          const colors = COLOR_CLASSES[category.color]
          const isSelected = value === category.value

          return (
            <button
              key={category.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(category.value)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-lg border-2 p-3 transition-all',
                'min-h-[80px] touch-manipulation',
                isSelected
                  ? cn(colors.bgSelected, colors.border, colors.text)
                  : cn(colors.bg, 'border-transparent', colors.text, 'hover:border-gray-200'),
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{category.label}</span>
            </button>
          )
        })}
      </div>
      {error && (
        <p id="category-error" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
