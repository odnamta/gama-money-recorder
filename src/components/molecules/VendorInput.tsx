'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Store, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface VendorSuggestion {
  id?: string
  name: string
}

interface VendorInputProps {
  value: string
  onChange: (value: string, vendorId?: string) => void
  suggestions?: VendorSuggestion[]
  onSearch?: (query: string) => void
  error?: string
  disabled?: boolean
  placeholder?: string
}

export function VendorInput({
  value,
  onChange,
  suggestions = [],
  onSearch,
  error,
  disabled = false,
  placeholder = 'Nama vendor (opsional)',
}: VendorInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync input value with external value
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      onChange(newValue, undefined)
      onSearch?.(newValue)
      setIsOpen(true)
    },
    [onChange, onSearch]
  )

  const handleSuggestionSelect = useCallback(
    (suggestion: VendorSuggestion) => {
      setInputValue(suggestion.name)
      onChange(suggestion.name, suggestion.id)
      setIsOpen(false)
      inputRef.current?.blur()
    },
    [onChange]
  )

  const handleClear = useCallback(() => {
    setInputValue('')
    onChange('', undefined)
    inputRef.current?.focus()
  }, [onChange])

  const handleFocus = useCallback(() => {
    if (suggestions.length > 0) {
      setIsOpen(true)
    }
  }, [suggestions.length])

  return (
    <div className="space-y-1" ref={containerRef}>
      <label className="text-sm font-medium text-gray-700">Vendor</label>
      <div className="relative">
        <div
          className={cn(
            'flex items-center rounded-lg border bg-white transition-colors',
            error
              ? 'border-red-500 ring-1 ring-red-500'
              : 'border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500',
            disabled && 'bg-gray-100 opacity-60'
          )}
        >
          <Store className="ml-3 h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            disabled={disabled}
            placeholder={placeholder}
            className="flex-1 bg-transparent px-3 py-3 text-gray-900 outline-none placeholder:text-gray-400"
            aria-label="Nama vendor"
            aria-invalid={!!error}
            aria-describedby={error ? 'vendor-error' : undefined}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls="vendor-suggestions"
            autoComplete="off"
          />
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="mr-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Hapus vendor"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {suggestions.length > 0 && (
            <ChevronDown
              className={cn(
                'mr-3 h-4 w-4 text-gray-400 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          )}
        </div>

        {/* Suggestions dropdown */}
        {isOpen && suggestions.length > 0 && (
          <ul
            id="vendor-suggestions"
            role="listbox"
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.id || `${suggestion.name}-${index}`}
                role="option"
                aria-selected={suggestion.name === inputValue}
                onClick={() => handleSuggestionSelect(suggestion)}
                className={cn(
                  'cursor-pointer px-4 py-2 text-sm hover:bg-gray-100',
                  suggestion.name === inputValue && 'bg-blue-50 text-blue-700'
                )}
              >
                {suggestion.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && (
        <p id="vendor-error" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
