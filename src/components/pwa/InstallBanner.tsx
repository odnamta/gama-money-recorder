'use client'

import { useState, useEffect } from 'react'
import { Smartphone, X, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePWAInstall } from '@/hooks/use-pwa-install'

const DISMISS_KEY = 'pwa-install-banner-dismissed'
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export function InstallBanner() {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall()
  const [dismissed, setDismissed] = useState(true) // Start hidden to prevent flash

  useEffect(() => {
    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10)
      if (elapsed < DISMISS_DURATION) {
        setDismissed(true)
        return
      }
    }
    setDismissed(false)
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
  }

  const handleInstall = async () => {
    const success = await promptInstall()
    if (success) {
      handleDismiss()
    }
  }

  // Don't show if already installed or dismissed
  if (isInstalled || dismissed) return null

  // Don't show if can't install and not iOS
  if (!canInstall && !isIOS) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-blue-600 text-white rounded-lg p-4 shadow-lg z-50 animate-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3">
        <Smartphone className="h-6 w-6 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium">Install Aplikasi</p>
          <p className="text-sm text-blue-100 mt-0.5">
            Akses lebih cepat dari home screen
          </p>
        </div>
        <button 
          onClick={handleDismiss} 
          className="text-blue-200 hover:text-white p-1"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {isIOS ? (
        <div className="mt-3 text-sm text-blue-100 flex items-center gap-2">
          <Share className="h-4 w-4" />
          <span>
            Tap <strong>Share</strong> lalu <strong>&quot;Add to Home Screen&quot;</strong>
          </span>
        </div>
      ) : (
        <Button
          variant="secondary"
          className="w-full mt-3"
          onClick={handleInstall}
        >
          Install Sekarang
        </Button>
      )}
    </div>
  )
}
