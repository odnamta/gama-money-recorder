'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SearchInputProps {
  /** Current search value */
  value: string
  /** Callback when search value changes */
  onChange: (value: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Debounce delay in milliseconds */
  debounceMs?: number
  /** Additional CSS classes */
  className?: string
}

/**
 * SearchInput - Debounced search input with clear button
 *
 * Features:
 * - Debounced input to prevent excessive filtering
 * - Clear button when there's input
 * - Search icon
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Cari pengeluaran...',
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Sync local value with external value
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Debounce the onChange callback
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [localValue, value, onChange, debounceMs])

  /**
   * Handle input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
  }

  /**
   * Clear the search input
   */
  const handleClear = () => {
    setLocalValue('')
    onChange('')
  }

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl',
          'text-slate-900 placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'transition-shadow'
        )}
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Hapus pencarian"
        >
          <X className="h-4 w-4 text-slate-400" />
        </button>
      )}
    </div>
  )
}
