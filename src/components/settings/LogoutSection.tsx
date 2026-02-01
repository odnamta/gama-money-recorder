'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { usePendingSync } from '@/hooks/use-pending-sync'
import { clearAllCache } from '@/lib/db/storage-utils'
import { Button } from '@/components/ui/button'
import { LogOut, AlertTriangle } from 'lucide-react'

/**
 * Logout section with pending data warning
 */
export function LogoutSection() {
  const router = useRouter()
  const { pendingCount, failedCount } = usePendingSync()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const totalPending = pendingCount + failedCount

  const handleLogout = async () => {
    // Warn about pending data
    if (totalPending > 0) {
      const confirmed = confirm(
        `⚠️ PERINGATAN\n\nAda ${totalPending} data yang belum tersinkron.\n\nJika Anda keluar sekarang, data tersebut akan HILANG PERMANEN!\n\nYakin ingin keluar?`
      )
      if (!confirmed) return
    } else {
      const confirmed = confirm('Yakin ingin keluar?')
      if (!confirmed) return
    }

    setIsLoggingOut(true)

    try {
      // Clear local data
      await clearAllCache()

      // Sign out from Supabase
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Logout error:', error)
        alert('Gagal keluar. Silakan coba lagi.')
        setIsLoggingOut(false)
        return
      }

      // Redirect to login
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      alert('Gagal keluar. Silakan coba lagi.')
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="bg-white rounded-lg p-4 space-y-3">
      {/* Warning if pending data */}
      {totalPending > 0 && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-900">
              Data Belum Tersinkron
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Ada {totalPending} data yang belum tersinkron. Sinkronkan terlebih dahulu sebelum keluar.
            </p>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <Button
        variant="destructive"
        className="w-full"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        {isLoggingOut ? 'Keluar...' : 'Keluar'}
      </Button>
    </div>
  )
}