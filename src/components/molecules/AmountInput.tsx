'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatCurrency, parseCurrency } from '@/lib/utils/format-currency'

interface AmountInputProps {
  value: number
  onChange: (value: number) => void
  error?: string
  disabled?: boolean
  autoFocus?: boolean
}

export function AmountInput({
  value,
  onChange,
  error,
  disabled = false,
  autoFocus = false,
}: AmountInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [displayValue, setDisplayValue] = useState(() =>
    value > 0 ? formatCurrency(value, { showSymbol: false }) : ''
  )

  // Sync display value when external value changes
  useEffect(() => {
    const currentParsed = parseCurrency(displayValue)
    if (currentParsed !== value) {
      setDisplayValue(value > 0 ? formatCurrency(value, { showSymbol: false }) : '')
    }
  }, [value, displayValue])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      const numericValue = parseCurrency(input)

      // Limit to reasonable amount (100 billion IDR)
      if (numericValue > 100_000_000_000) return

      setDisplayValue(numericValue > 0 ? formatCurrency(numericValue, { showSymbol: false }) : '')
      onChange(numericValue)
    },
    [onChange]
  )

  const handleClear = useCallback(() => {
    setDisplayValue('')
    onChange(0)
    inputRef.current?.focus()
  }, [onChange])

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">Jumlah</label>
      <div
        className={cn(
          'relative flex items-center rounded-lg border bg-white transition-colors',
          error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500',
          disabled && 'bg-gray-100 opacity-60'
        )}
      >
        <span className="pl-4 text-lg font-medium text-gray-500">Rp</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder="0"
          className={cn(
            'flex-1 bg-transparent py-4 pl-2 pr-12 text-right text-2xl font-semibold text-gray-900 outline-none',
            'placeholder:text-gray-400'
          )}
          aria-label="Jumlah pengeluaran"
          aria-invalid={!!error}
          aria-describedby={error ? 'amount-error' : undefined}
        />
        {value > 0 && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Hapus jumlah"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      {error && (
        <p id="amount-error" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
