'use client'

import { useSettings } from '@/hooks/use-settings'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/utils/format-date'

const SYNC_INTERVALS = [
  { value: 5, label: '5 menit' },
  { value: 15, label: '15 menit' },
  { value: 30, label: '30 menit' },
  { value: 0, label: 'Manual' }
] as const

/**
 * Sync settings section
 */
export function SyncSection() {
  const { settings, updateSettings, isLoading } = useSettings()

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-4 space-y-4">
        <div className="h-5 bg-slate-200 rounded animate-pulse" />
        <div className="space-y-3">
          <div className="h-12 bg-slate-200 rounded animate-pulse" />
          <div className="h-12 bg-slate-200 rounded animate-pulse" />
          <div className="h-12 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-4 space-y-4">
      <h3 className="font-semibold text-lg">Sinkronisasi</h3>
      
      {/* Auto Sync Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium">Sinkron Otomatis</p>
          <p className="text-sm text-muted-foreground">
            Sinkron data secara otomatis saat online
          </p>
        </div>
        <Switch
          checked={settings.autoSync}
          onCheckedChange={(checked) => updateSettings({ autoSync: checked })}
        />
      </div>
      
      {/* Sync Interval */}
      {settings.autoSync && (
        <div className="space-y-2">
          <Label htmlFor="sync-interval">Interval Sinkron</Label>
          <Select
            value={String(settings.syncInterval)}
            onValueChange={(value) => updateSettings({ 
              syncInterval: Number(value) as 5 | 15 | 30 | 0 
            })}
          >
            <SelectTrigger id="sync-interval" className="w-full">
              <SelectValue placeholder="Pilih interval" />
            </SelectTrigger>
            <SelectContent>
              {SYNC_INTERVALS.map(({ value, label }) => (
                <SelectItem key={value} value={String(value)}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* WiFi Only */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium">Hanya WiFi</p>
          <p className="text-sm text-muted-foreground">
            Sinkron hanya saat terhubung WiFi
          </p>
        </div>
        <Switch
          checked={settings.wifiOnly}
          onCheckedChange={(checked) => updateSettings({ wifiOnly: checked })}
        />
      </div>
      
      {/* Last Sync */}
      {settings.lastSyncAt && (
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            Terakhir sinkron: {formatDate(new Date(settings.lastSyncAt), 'relative')}
          </p>
        </div>
      )}
    </div>
  )
}