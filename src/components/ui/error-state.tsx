'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  compact?: boolean
}

export function ErrorState({ 
  message = 'Terjadi kesalahan', 
  onRetry,
  compact = false 
}: ErrorStateProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 p-2 bg-red-50 rounded-lg">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1">{message}</span>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="text-red-700 hover:text-red-800 p-1"
            aria-label="Coba lagi"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <p className="text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Coba Lagi
        </Button>
      )}
    </div>
  )
}
