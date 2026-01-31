'use client'

import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface DescriptionInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  placeholder?: string
  maxLength?: number
}

export function DescriptionInput({
  value,
  onChange,
  error,
  disabled = false,
  placeholder = 'Catatan tambahan (opsional)',
  maxLength = 500,
}: DescriptionInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">Catatan</label>
      <div
        className={cn(
          'flex rounded-lg border bg-white transition-colors',
          error
            ? 'border-red-500 ring-1 ring-red-500'
            : 'border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500',
          disabled && 'bg-gray-100 opacity-60'
        )}
      >
        <FileText className="ml-3 mt-3 h-5 w-5 flex-shrink-0 text-gray-400" />
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={2}
          className="flex-1 resize-none bg-transparent px-3 py-3 text-gray-900 outline-none placeholder:text-gray-400"
          aria-label="Catatan pengeluaran"
          aria-invalid={!!error}
          aria-describedby={error ? 'description-error' : undefined}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        {error ? (
          <p id="description-error" className="text-red-600">
            {error}
          </p>
        ) : (
          <span />
        )}
        <span>
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  )
}
