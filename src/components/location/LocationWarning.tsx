'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatDistance } from '@/lib/utils/geo'
import { Button } from '@/components/ui/button'

export interface LocationWarningProps {
  /** Distance from job location in kilometers */
  distance: number
  /** Distance threshold in kilometers (default 50) */
  threshold?: number
  /** Callback when user proceeds with explanation */
  onProceed: (explanation: string) => void
  /** Callback when user cancels */
  onCancel: () => void
  /** Additional CSS classes */
  className?: string
}

const MIN_EXPLANATION_LENGTH = 10

/**
 * LocationWarning component displays a warning when the user is far from the job location.
 * It requires the user to provide an explanation (minimum 10 characters) before proceeding.
 * 
 * @example
 * <LocationWarning
 *   distance={75.5}
 *   threshold={50}
 *   onProceed={(explanation) => console.log('Proceeding with:', explanation)}
 *   onCancel={() => console.log('Cancelled')}
 * />
 */
export function LocationWarning({
  distance,
  threshold = 50,
  onProceed,
  onCancel,
  className,
}: LocationWarningProps) {
  const [explanation, setExplanation] = useState('')

  const isExplanationValid = explanation.trim().length >= MIN_EXPLANATION_LENGTH
  const remainingChars = MIN_EXPLANATION_LENGTH - explanation.trim().length

  const handleProceed = () => {
    if (isExplanationValid) {
      onProceed(explanation.trim())
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-4 rounded-lg',
        'bg-amber-50 border border-amber-200',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Header with icon and title */}
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-amber-800">
            Lokasi Jauh dari Job
          </h4>
          <p className="text-sm text-amber-700 mt-1">
            Anda berada {formatDistance(distance)} dari lokasi job (batas: {threshold} km).
            Mohon berikan penjelasan untuk melanjutkan.
          </p>
        </div>
      </div>

      {/* Explanation textarea */}
      <div className="space-y-1.5">
        <textarea
          placeholder="Jelaskan mengapa lokasi berbeda..."
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className={cn(
            'w-full min-h-[80px] rounded-md border border-amber-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors outline-none resize-none',
            'placeholder:text-amber-400',
            'focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
          )}
          aria-label="Penjelasan lokasi"
          aria-describedby="explanation-hint"
        />
        {!isExplanationValid && explanation.length > 0 && (
          <p id="explanation-hint" className="text-xs text-amber-600">
            Minimal {remainingChars} karakter lagi
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-amber-300 text-amber-800 hover:bg-amber-100"
        >
          Batal
        </Button>
        <Button
          type="button"
          onClick={handleProceed}
          disabled={!isExplanationValid}
          className="bg-amber-600 text-white hover:bg-amber-700 disabled:bg-amber-300"
        >
          Lanjutkan
        </Button>
      </div>
    </div>
  )
}
