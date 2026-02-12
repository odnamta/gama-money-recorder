'use client'

import { Smartphone, Check, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePWAInstall } from '@/hooks/use-pwa-install'

export function InstallPromptSettings() {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall()

  if (isInstalled) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="font-medium text-green-900">Aplikasi Terinstall</p>
          <p className="text-sm text-green-700">
            Anda sudah menggunakan versi terinstall
          </p>
        </div>
      </div>
    )
  }

  if (isIOS) {
    return (
      <div className="p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">Install di iOS</p>
            <p className="text-sm text-muted-foreground">
              Tambahkan ke Home Screen
            </p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2 pl-[52px]">
          <Share className="h-4 w-4" />
          <span>
            Tap <strong>Share</strong> → <strong>&quot;Add to Home Screen&quot;</strong>
          </span>
        </div>
      </div>
    )
  }

  if (!canInstall) {
    return (
      <div className="p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Install Aplikasi</p>
            <p className="text-sm text-muted-foreground">
              Buka di browser untuk menginstall
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Smartphone className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium">Install Aplikasi</p>
          <p className="text-sm text-muted-foreground">
            Akses lebih cepat dari home screen
          </p>
        </div>
      </div>
      <Button onClick={promptInstall} className="w-full">
        Install Sekarang
      </Button>
    </div>
  )
}
