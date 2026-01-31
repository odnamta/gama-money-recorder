'use client'

/**
 * Confidence Field Wrapper Component
 * 
 * Wraps form fields to show OCR confidence indicators.
 * Highlights fields with low confidence that need manual review.
 */

import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ConfidenceFieldProps {
  /** Confidence score (0-1), undefined if not from OCR */
  confidence?: number
  /** Whether this field was auto-filled by OCR */
  isOCRFilled?: boolean
  /** Child form field */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

const REVIEW_THRESHOLD = 0.8

export function ConfidenceField({
  confidence,
  isOCRFilled = false,
  children,
  className,
}: ConfidenceFieldProps) {
  const needsReview = isOCRFilled && confidence !== undefined && confidence < REVIEW_THRESHOLD
  
  return (
    <div className={cn('relative', className)}>
      {children}
      {needsReview && (
        <>
          {/* Highlight ring */}
          <div className="absolute inset-0 pointer-events-none rounded-md ring-2 ring-yellow-400 ring-offset-1" />
          {/* Warning badge */}
          <span className="absolute -top-2 -right-2 flex items-center gap-0.5 bg-yellow-400 text-yellow-900 text-[10px] px-1.5 py-0.5 rounded font-medium">
            <AlertTriangle className="h-3 w-3" />
            Perlu cek
          </span>
        </>
      )}
    </div>
  )
}
