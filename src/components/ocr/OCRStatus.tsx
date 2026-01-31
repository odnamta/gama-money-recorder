'use client'

/**
 * OCR Status Display Component
 * 
 * Shows the current status of OCR processing including:
 * - Processing indicator with progress
 * - Success message with processing time
 * - Error message with retry option
 */

import { Loader2, CheckCircle, AlertCircle, WifiOff } from 'lucide-react'
import type { OCRState, OCRResult } from '@/types/ocr'
import { ConfidenceBadge } from './ConfidenceBadge'
import { cn } from '@/lib/utils/cn'

interface OCRStatusProps {
  /** Current OCR state */
  status: OCRState['status']
  /** Processing progress (0-1) */
  progress: number
  /** OCR result if successful */
  result: OCRResult | null
  /** Error if processing failed */
  error: Error | null
  /** Current provider being used */
  provider?: 'google_vision' | 'tesseract' | null
  /** Callback to retry OCR */
  onRetry?: () => void
  /** Callback to skip OCR */
  onSkip?: () => void
  /** Additional CSS classes */
  className?: string
}

export function OCRStatus({
  status,
  progress,
  result,
  error,
  provider,
  onRetry,
  onSkip,
  className,
}: OCRStatusProps) {
  if (status === 'idle') {
    return null
  }
  
  if (status === 'processing') {
    const progressPercent = Math.round(progress * 100)
    const isOffline = provider === 'tesseract'
    
    return (
      <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>
          Membaca struk...
          {progressPercent > 0 && ` ${progressPercent}%`}
        </span>
        {isOffline && (
          <span className="flex items-center gap-1 text-xs text-yellow-600">
            <WifiOff className="h-3 w-3" />
            Offline
          </span>
        )}
      </div>
    )
  }
  
  if (status === 'error') {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error?.message || 'Gagal membaca struk'}</span>
        </div>
        <div className="flex gap-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs text-primary hover:underline"
            >
              Coba lagi
            </button>
          )}
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="text-xs text-muted-foreground hover:underline"
            >
              Isi manual
            </button>
          )}
        </div>
      </div>
    )
  }
  
  if (status === 'success' && result) {
    const hasExtractedData = result.extractedData.amount !== undefined ||
      result.extractedData.vendorName !== undefined ||
      result.extractedData.date !== undefined
    
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span className="text-muted-foreground">
          {hasExtractedData ? 'Struk terbaca' : 'Tidak ada data terdeteksi'}
          {result.processingTime > 0 && (
            <span className="text-xs ml-1">
              ({(result.processingTime / 1000).toFixed(1)}s)
            </span>
          )}
        </span>
        {hasExtractedData && <ConfidenceBadge confidence={result.confidence} />}
      </div>
    )
  }
  
  return null
}
