'use client'

/**
 * Manual Review Prompt Component
 * 
 * Shown when OCR confidence is low, prompting user to verify extracted data.
 */

import { AlertTriangle, CheckCircle } from 'lucide-react'
import type { OCRResult } from '@/types/ocr'
import { formatCurrency } from '@/lib/utils/format-currency'
import { formatDate } from '@/lib/utils/format-date'
import { cn } from '@/lib/utils/cn'

interface ManualReviewPromptProps {
  /** OCR result to review */
  result: OCRResult
  /** Callback when user confirms the data */
  onConfirm: () => void
  /** Callback when user wants to edit */
  onEdit: () => void
  /** Additional CSS classes */
  className?: string
}

export function ManualReviewPrompt({
  result,
  onConfirm,
  onEdit,
  className,
}: ManualReviewPromptProps) {
  const { extractedData } = result
  
  return (
    <div className={cn(
      'rounded-lg border border-yellow-200 bg-yellow-50 p-4',
      className
    )}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-yellow-800">
            Perlu Verifikasi Manual
          </h4>
          <p className="text-xs text-yellow-700 mt-1">
            Hasil pembacaan struk memiliki tingkat kepercayaan rendah. 
            Mohon periksa data berikut:
          </p>
          
          {/* Extracted data summary */}
          <div className="mt-3 space-y-2 text-sm">
            {extractedData.amount !== undefined && (
              <div className="flex justify-between">
                <span className="text-yellow-700">Jumlah:</span>
                <span className="font-medium text-yellow-900">
                  {formatCurrency(extractedData.amount)}
                </span>
              </div>
            )}
            {extractedData.vendorName && (
              <div className="flex justify-between">
                <span className="text-yellow-700">Vendor:</span>
                <span className="font-medium text-yellow-900">
                  {extractedData.vendorName}
                </span>
              </div>
            )}
            {extractedData.date && (
              <div className="flex justify-between">
                <span className="text-yellow-700">Tanggal:</span>
                <span className="font-medium text-yellow-900">
                  {formatDate(extractedData.date, 'medium')}
                </span>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onConfirm}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Data Benar
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="px-3 py-1.5 text-sm font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-md transition-colors"
            >
              Edit Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
