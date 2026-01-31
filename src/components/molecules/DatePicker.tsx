'use client'

import { useCallback, useMemo } from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatDate, toDateInputValue, fromDateInputValue } from '@/lib/utils/format-date'

interface DatePickerProps {
  value: Date
  onChange: (date: Date) => void
  error?: string
  disabled?: boolean
  maxDate?: Date
  minDate?: Date
}

export function DatePicker({
  value,
  onChange,
  error,
  disabled = false,
  maxDate = new Date(),
  minDate,
}: DatePickerProps) {
  const inputValue = useMemo(() => toDateInputValue(value), [value])
  const maxValue = useMemo(() => toDateInputValue(maxDate), [maxDate])
  const minValue = useMemo(() => (minDate ? toDateInputValue(minDate) : undefined), [minDate])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = fromDateInputValue(e.target.value)
      onChange(newDate)
    },
    [onChange]
  )

  // Quick date buttons
  const quickDates = useMemo(() => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    return [
      { label: 'Hari ini', date: today },
      { label: 'Kemarin', date: yesterday },
    ]
  }, [])

  const isQuickDateSelected = useCallback(
    (date: Date) => {
      return toDateInputValue(date) === inputValue
    },
    [inputValue]
  )

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Tanggal</label>

      {/* Quick date buttons */}
      <div className="flex gap-2">
        {quickDates.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled={disabled}
            onClick={() => onChange(item.date)}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium transition-colors',
              isQuickDateSelected(item.date)
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Date input */}
      <div
        className={cn(
          'flex items-center rounded-lg border bg-white transition-colors',
          error
            ? 'border-red-500 ring-1 ring-red-500'
            : 'border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500',
          disabled && 'bg-gray-100 opacity-60'
        )}
      >
        <Calendar className="ml-3 h-5 w-5 text-gray-400" />
        <input
          type="date"
          value={inputValue}
          onChange={handleChange}
          max={maxValue}
          min={minValue}
          disabled={disabled}
          className="flex-1 bg-transparent px-3 py-3 text-gray-900 outline-none"
          aria-label="Tanggal pengeluaran"
          aria-invalid={!!error}
          aria-describedby={error ? 'date-error' : undefined}
        />
        <span className="mr-3 text-sm text-gray-500">{formatDate(value, 'medium')}</span>
      </div>

      {error && (
        <p id="date-error" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
