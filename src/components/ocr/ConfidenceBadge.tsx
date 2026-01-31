'use client'

/**
 * Confidence Badge Component
 * 
 * Displays OCR confidence level with color-coded badge.
 * - High (≥90%): Green "Akurat"
 * - Medium (80-89%): Yellow "Perlu Cek"
 * - Low (<80%): Red "Manual"
 */

import { getConfidenceLevel, formatConfidence, type ConfidenceLevel } from '@/types/ocr'
import { cn } from '@/lib/utils/cn'

interface ConfidenceBadgeProps {
  /** Confidence score (0-1) */
  confidence: number
  /** Show percentage value */
  showPercentage?: boolean
  /** Size variant */
  size?: 'sm' | 'md'
  /** Additional CSS classes */
  className?: string
}

const confidenceStyles: Record<ConfidenceLevel, string> = {
  high: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-red-100 text-red-800 border-red-200',
}

const confidenceLabels: Record<ConfidenceLevel, string> = {
  high: 'Akurat',
  medium: 'Perlu Cek',
  low: 'Manual',
}

const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
}

export function ConfidenceBadge({
  confidence,
  showPercentage = true,
  size = 'md',
  className,
}: ConfidenceBadgeProps) {
  const level = getConfidenceLevel(confidence)
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded font-medium border',
        confidenceStyles[level],
        sizeClasses[size],
        className
      )}
    >
      {confidenceLabels[level]}
      {showPercentage && (
        <span className="ml-1 opacity-75">
          ({formatConfidence(confidence)})
        </span>
      )}
    </span>
  )
}
