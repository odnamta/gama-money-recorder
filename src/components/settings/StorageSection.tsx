'use client'

import { useState } from 'react'
import { useStorageUsage } from '@/hooks/use-storage-usage'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { clearSyncedData, clearAllCache } from '@/lib/db/storage-utils'
import { Trash2, AlertTriangle } from 'lucide-react'

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

/**
 * Storage management section
 */
export function StorageSection() {
  const { usage, isLoading, refresh } = useStorageUsage()
  const [isClearing, setIsClearing] = useState(false)

  const handleClearSynced = async () => {
    const confirmed = confirm(
      'Hapus data yang sudah tersinkron? Data yang belum tersinkron akan tetap aman.'
    )
    if (!confirmed) return

    setIsClearing(true)
    try {
      await clearSyncedData()
      await refresh()
      alert('Data tersinkron berhasil dihapus')
    } catch (error) {
      console.error('Failed to clear synced data:', error)
      alert('Gagal menghapus data tersinkron')
    } finally {
      setIsClearing(false)
    }
  }

  const handleClearAll = async () => {
    const confirmed = confirm(
      '⚠️ PERINGATAN: Hapus semua cache?\n\nData yang belum tersinkron akan HILANG PERMANEN!\n\nYakin ingin melanjutkan?'
    )
    if (!confirmed) return

    setIsClearing(true)
    try {
      await clearAllCache()
      await refresh()
      alert('Semua cache berhasil dihapus')
    } catch (error) {
      console.error('Failed to clear all cache:', error)
      alert('Gagal menghapus cache')
    } finally {
      setIsClearing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-4 space-y-4">
        <div className="h-5 bg-slate-200 rounded animate-pulse" />
        <div className="space-y-3">
          <div className="h-20 bg-slate-200 rounded animate-pulse" />
          <div className="h-12 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  const maxStorage = 50_000_000 // 50MB limit
  const usagePercent = usage ? Math.min((usage.total / maxStorage) * 100, 100) : 0

  return (
    <div className="bg-white rounded-lg p-4 space-y-4">
      <h3 className="font-semibold text-lg">Penyimpanan</h3>
      
      {usage ? (
        <>
          {/* Total Usage */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Total Penggunaan</span>
              <span className="font-mono">{formatBytes(usage.total)}</span>
            </div>
            <Progress 
              value={usagePercent} 
              className="h-3"
              indicatorClassName={
                usagePercent > 80 
                  ? 'bg-red-600' 
                  : usagePercent > 60 
                  ? 'bg-yellow-600' 
                  : 'bg-green-600'
              }
            />
            <p className="text-xs text-muted-foreground">
              {usagePercent.toFixed(1)}% dari {formatBytes(maxStorage)}
            </p>
          </div>
          
          {/* Storage Breakdown */}
          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm font-medium text-muted-foreground">Rincian</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pengeluaran</span>
                <span className="font-mono">{formatBytes(usage.expenses)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Struk</span>
                <span className="font-mono">{formatBytes(usage.receipts)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cache Job</span>
                <span className="font-mono">{formatBytes(usage.jobCache)}</span>
              </div>
            </div>
          </div>
          
          {/* Clear Data Buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSynced}
              disabled={isClearing}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus Data Tersinkron
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
              disabled={isClearing}
              className="w-full"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Hapus Semua Cache
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Tidak dapat menghitung penggunaan penyimpanan
          </p>
        </div>
      )}
    </div>
  )
}