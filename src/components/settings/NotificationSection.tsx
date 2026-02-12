'use client'

import { Bell, BellOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { usePushNotifications } from '@/hooks/use-push-notifications'

export function NotificationSection() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  } = usePushNotifications()

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe()
    } else {
      await subscribe()
    }
  }

  if (!isSupported) {
    return (
      <section className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold">Notifikasi</h2>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <BellOff className="h-5 w-5" />
            <span className="text-sm">
              Notifikasi tidak didukung di browser ini
            </span>
          </div>
        </div>
      </section>
    )
  }

  if (permission === 'denied') {
    return (
      <section className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold">Notifikasi</h2>
        </div>
        <div className="p-4">
          <div className="flex items-start gap-3 text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Notifikasi Diblokir</p>
              <p className="text-amber-700 mt-1">
                Izinkan notifikasi di pengaturan browser untuk menerima pemberitahuan.
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white rounded-lg border">
      <div className="px-4 py-3 border-b">
        <h2 className="font-semibold">Notifikasi</h2>
      </div>
      <div className="p-4 space-y-4">
        {/* Main toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                Terima pemberitahuan sinkronisasi & persetujuan
              </p>
            </div>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={isLoading}
          />
        </div>

        {/* Status info */}
        {isSubscribed && (
          <div className="text-sm text-muted-foreground pl-[52px]">
            <p>Anda akan menerima notifikasi untuk:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>Sinkronisasi selesai/gagal</li>
              <li>Status persetujuan pengeluaran</li>
              <li>Pengingat pengeluaran tertunda</li>
            </ul>
          </div>
        )}

        {/* Test notification button (dev only) */}
        {process.env.NODE_ENV === 'development' && isSubscribed && (
          <Button
            variant="outline"
            size="sm"
            className="ml-[52px]"
            onClick={async () => {
              const { showLocalNotification } = await import('@/lib/notifications/client')
              await showLocalNotification('Test Notifikasi', {
                body: 'Ini adalah notifikasi test dari GAMA Money Recorder',
              })
            }}
          >
            Test Notifikasi
          </Button>
        )}
      </div>
    </section>
  )
}
