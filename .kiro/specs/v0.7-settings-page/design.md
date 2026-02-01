# v0.7 Settings Page - Technical Design

## Overview
Implement settings page with profile display, sync management, storage controls, and logout functionality.

## Component Architecture

```
/settings
├── SettingsPage (page)
│   ├── ProfileSection (organism)
│   │   ├── UserAvatar (atom)
│   │   ├── UserInfo (molecule)
│   │   └── RoleBadge (atom)
│   ├── SyncSection (organism)
│   │   ├── SyncToggle (molecule)
│   │   ├── SyncIntervalSelect (molecule)
│   │   ├── WifiOnlyToggle (molecule)
│   │   └── LastSyncInfo (atom)
│   ├── PendingSyncSection (organism)
│   │   ├── PendingCount (molecule)
│   │   ├── PendingSyncList (molecule)
│   │   └── ManualSyncButton (atom)
│   ├── StorageSection (organism)
│   │   ├── StorageUsage (molecule)
│   │   ├── StorageBreakdown (molecule)
│   │   └── ClearDataButtons (molecule)
│   ├── AppInfoSection (organism)
│   │   └── VersionInfo (molecule)
│   └── LogoutSection (organism)
│       └── LogoutButton (atom)
```

## Data Layer

### Settings Storage
```typescript
// lib/settings/storage.ts
interface AppSettings {
  autoSync: boolean
  syncInterval: 5 | 15 | 30 | 0 // 0 = manual
  wifiOnly: boolean
  lastSyncAt: string | null
}

const DEFAULT_SETTINGS: AppSettings = {
  autoSync: true,
  syncInterval: 15,
  wifiOnly: false,
  lastSyncAt: null
}

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  const stored = localStorage.getItem('app-settings')
  return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS
}

export function saveSettings(settings: Partial<AppSettings>): void {
  const current = getSettings()
  const updated = { ...current, ...settings }
  localStorage.setItem('app-settings', JSON.stringify(updated))
}
```

### Settings Hook
```typescript
// hooks/use-settings.ts
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  
  useEffect(() => {
    setSettings(getSettings())
  }, [])
  
  const updateSettings = (updates: Partial<AppSettings>) => {
    saveSettings(updates)
    setSettings(prev => ({ ...prev, ...updates }))
  }
  
  return { settings, updateSettings }
}
```

### Storage Usage Hook
```typescript
// hooks/use-storage-usage.ts
interface StorageUsage {
  expenses: number
  receipts: number
  jobCache: number
  total: number
}

export function useStorageUsage() {
  const [usage, setUsage] = useState<StorageUsage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const calculateUsage = async () => {
      const expenses = await db.expenses.count()
      const receipts = await db.receipts.count()
      const jobs = await db.jobCache.count()
      
      // Estimate sizes
      const expenseSize = expenses * 500 // ~500 bytes per expense
      const receiptSize = await getReceiptStorageSize()
      const jobSize = jobs * 200 // ~200 bytes per job
      
      setUsage({
        expenses: expenseSize,
        receipts: receiptSize,
        jobCache: jobSize,
        total: expenseSize + receiptSize + jobSize
      })
      setIsLoading(false)
    }
    
    calculateUsage()
  }, [])
  
  return { usage, isLoading }
}
```

## Components

### Profile Section
```typescript
// components/settings/ProfileSection.tsx
export function ProfileSection() {
  const { user, profile } = useUser()
  
  if (!user) return null
  
  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.user_metadata.avatar_url} />
          <AvatarFallback>{getInitials(user.user_metadata.full_name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold text-lg">{user.user_metadata.full_name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <RoleBadge role={profile?.role} />
        </div>
      </div>
    </div>
  )
}
```

### Sync Section
```typescript
// components/settings/SyncSection.tsx
const SYNC_INTERVALS = [
  { value: 5, label: '5 menit' },
  { value: 15, label: '15 menit' },
  { value: 30, label: '30 menit' },
  { value: 0, label: 'Manual' }
]

export function SyncSection() {
  const { settings, updateSettings } = useSettings()
  
  return (
    <div className="bg-white rounded-lg p-4 space-y-4">
      <h3 className="font-semibold">Sinkronisasi</h3>
      
      {/* Auto Sync Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Sinkron Otomatis</p>
          <p className="text-sm text-muted-foreground">
            Sinkron data saat online
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
          <Label>Interval Sinkron</Label>
          <Select
            value={String(settings.syncInterval)}
            onValueChange={(v) => updateSettings({ syncInterval: Number(v) as any })}
          >
            {SYNC_INTERVALS.map(({ value, label }) => (
              <SelectItem key={value} value={String(value)}>
                {label}
              </SelectItem>
            ))}
          </Select>
        </div>
      )}
      
      {/* WiFi Only */}
      <div className="flex items-center justify-between">
        <div>
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
        <p className="text-sm text-muted-foreground">
          Terakhir sinkron: {formatRelative(settings.lastSyncAt)}
        </p>
      )}
    </div>
  )
}
```

### Storage Section
```typescript
// components/settings/StorageSection.tsx
export function StorageSection() {
  const { usage, isLoading } = useStorageUsage()
  const [isClearing, setIsClearing] = useState(false)
  
  const handleClearSynced = async () => {
    if (!confirm('Hapus data yang sudah tersinkron?')) return
    setIsClearing(true)
    await clearSyncedData()
    setIsClearing(false)
    toast.success('Data tersinkron dihapus')
  }
  
  const handleClearAll = async () => {
    if (!confirm('Hapus semua cache? Data yang belum tersinkron akan hilang!')) return
    setIsClearing(true)
    await clearAllCache()
    setIsClearing(false)
    toast.success('Semua cache dihapus')
  }
  
  return (
    <div className="bg-white rounded-lg p-4 space-y-4">
      <h3 className="font-semibold">Penyimpanan</h3>
      
      {isLoading ? (
        <Skeleton className="h-20" />
      ) : usage && (
        <>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total</span>
              <span>{formatBytes(usage.total)}</span>
            </div>
            <Progress value={Math.min((usage.total / 50_000_000) * 100, 100)} />
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pengeluaran</span>
              <span>{formatBytes(usage.expenses)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Struk</span>
              <span>{formatBytes(usage.receipts)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cache Job</span>
              <span>{formatBytes(usage.jobCache)}</span>
            </div>
          </div>
        </>
      )}
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearSynced}
          disabled={isClearing}
        >
          Hapus Tersinkron
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleClearAll}
          disabled={isClearing}
        >
          Hapus Semua
        </Button>
      </div>
    </div>
  )
}
```

### Logout Section
```typescript
// components/settings/LogoutSection.tsx
export function LogoutSection() {
  const router = useRouter()
  const { pendingCount } = usePendingSync()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  const handleLogout = async () => {
    if (pendingCount > 0) {
      const confirmed = confirm(
        `Ada ${pendingCount} data yang belum tersinkron. Yakin ingin keluar?`
      )
      if (!confirmed) return
    }
    
    setIsLoggingOut(true)
    
    // Clear local data
    await clearAllCache()
    
    // Sign out from Supabase
    const supabase = createClient()
    await supabase.auth.signOut()
    
    router.push('/login')
  }
  
  return (
    <div className="bg-white rounded-lg p-4">
      <Button
        variant="destructive"
        className="w-full"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? 'Keluar...' : 'Keluar'}
      </Button>
    </div>
  )
}
```

## Page Layout
```typescript
// app/(auth)/settings/page.tsx
export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b px-4 py-4">
        <h1 className="text-xl font-bold">Pengaturan</h1>
      </div>
      
      <div className="px-4 py-4 space-y-4">
        <ProfileSection />
        <SyncSection />
        <PendingSyncSection />
        <StorageSection />
        <AppInfoSection />
        <LogoutSection />
      </div>
    </div>
  )
}
```

## Testing Strategy

### Unit Tests
- Settings storage functions
- Storage calculation
- Logout flow

### Integration Tests
- Settings persistence
- Clear data operations
- Sync toggle behavior

### E2E Tests
- Complete settings flow
- Logout with pending data
- Storage management
