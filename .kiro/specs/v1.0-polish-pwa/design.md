# v1.0 Polish & PWA - Technical Design

## Overview
Implement PWA enhancements, push notifications, performance optimizations, and final polish for production release.

## PWA Configuration

### Manifest Enhancement
```typescript
// app/manifest.ts
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GAMA Money Recorder',
    short_name: 'Money Recorder',
    description: 'Catat pengeluaran dengan cepat dan mudah',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
    screenshots: [
      {
        src: '/screenshots/capture.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow'
      },
      {
        src: '/screenshots/history.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow'
      }
    ]
  }
}
```

### Install Prompt
```typescript
// hooks/use-pwa-install.ts
export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  
  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }
    
    const handleBeforeInstall = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])
  
  const promptInstall = async () => {
    if (!installPrompt) return false
    
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    
    if (outcome === 'accepted') {
      setInstallPrompt(null)
      return true
    }
    return false
  }
  
  return { canInstall: !!installPrompt, isInstalled, promptInstall }
}
```

### Install Banner
```typescript
// components/pwa/InstallBanner.tsx
export function InstallBanner() {
  const { canInstall, promptInstall } = usePWAInstall()
  const [dismissed, setDismissed] = useState(false)
  
  useEffect(() => {
    const wasDismissed = localStorage.getItem('install-banner-dismissed')
    if (wasDismissed) setDismissed(true)
  }, [])
  
  if (!canInstall || dismissed) return null
  
  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('install-banner-dismissed', 'true')
  }
  
  return (
    <div className="fixed bottom-20 left-4 right-4 bg-blue-600 text-white rounded-lg p-4 shadow-lg z-50">
      <div className="flex items-start gap-3">
        <Smartphone className="h-6 w-6 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium">Install Aplikasi</p>
          <p className="text-sm text-blue-100">
            Akses lebih cepat dari home screen
          </p>
        </div>
        <button onClick={handleDismiss} className="text-blue-200">
          <X className="h-5 w-5" />
        </button>
      </div>
      <Button
        variant="secondary"
        className="w-full mt-3"
        onClick={promptInstall}
      >
        Install Sekarang
      </Button>
    </div>
  )
}
```

## Push Notifications

### Service Worker Registration
```typescript
// lib/notifications/register.ts
export async function registerPushNotifications(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false
  }
  
  try {
    const registration = await navigator.serviceWorker.ready
    
    // Request permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return false
    
    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    })
    
    // Save subscription to server
    await saveSubscription(subscription)
    
    return true
  } catch (error) {
    console.error('Push registration failed:', error)
    return false
  }
}
```

### Notification Types
```typescript
// lib/notifications/types.ts
type NotificationType = 
  | 'sync_complete'
  | 'sync_failed'
  | 'approval_approved'
  | 'approval_rejected'
  | 'pending_reminder'

interface NotificationPayload {
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
}

const NOTIFICATION_MESSAGES: Record<NotificationType, (data?: any) => NotificationPayload> = {
  sync_complete: (count) => ({
    type: 'sync_complete',
    title: 'Sinkronisasi Selesai',
    body: `${count} pengeluaran berhasil disinkron`
  }),
  sync_failed: (count) => ({
    type: 'sync_failed',
    title: 'Sinkronisasi Gagal',
    body: `${count} pengeluaran gagal disinkron. Tap untuk coba lagi.`
  }),
  approval_approved: (expense) => ({
    type: 'approval_approved',
    title: 'Pengeluaran Disetujui',
    body: `${formatCurrency(expense.amount)} - ${expense.category}`
  }),
  approval_rejected: (expense) => ({
    type: 'approval_rejected',
    title: 'Pengeluaran Ditolak',
    body: `${formatCurrency(expense.amount)} - Tap untuk detail`
  }),
  pending_reminder: (count) => ({
    type: 'pending_reminder',
    title: 'Pengeluaran Menunggu',
    body: `${count} pengeluaran belum disinkron`
  })
}
```

## Performance Optimization

### Bundle Analysis
```typescript
// next.config.ts
const config: NextConfig = {
  // Enable bundle analyzer in development
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: './analyze/client.html'
          })
        )
      }
      return config
    }
  })
}
```

### Image Optimization
```typescript
// components/ui/OptimizedImage.tsx
export function OptimizedImage({ src, alt, ...props }: ImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  
  return (
    <div className="relative">
      {isLoading && <Skeleton className="absolute inset-0" />}
      <Image
        src={src}
        alt={alt}
        onLoad={() => setIsLoading(false)}
        loading="lazy"
        {...props}
      />
    </div>
  )
}
```

### Code Splitting
```typescript
// Lazy load heavy components
const ExpenseDetailSheet = dynamic(
  () => import('@/components/history/ExpenseDetailSheet'),
  { loading: () => <SheetSkeleton /> }
)

const FilterSheet = dynamic(
  () => import('@/components/history/FilterSheet'),
  { loading: () => <SheetSkeleton /> }
)
```

## Error Handling

### Error Boundary
```typescript
// components/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Log to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Terjadi Kesalahan</h1>
            <p className="text-muted-foreground mb-4">
              Maaf, terjadi kesalahan. Silakan coba lagi.
            </p>
            <Button onClick={() => window.location.reload()}>
              Muat Ulang
            </Button>
          </div>
        </div>
      )
    }
    
    return this.props.children
  }
}
```

### Error Messages
```typescript
// lib/errors/messages.ts
export const ERROR_MESSAGES: Record<string, string> = {
  // Network
  'network_error': 'Tidak dapat terhubung ke server. Periksa koneksi internet.',
  'timeout': 'Koneksi timeout. Silakan coba lagi.',
  
  // Auth
  'auth_expired': 'Sesi telah berakhir. Silakan login kembali.',
  'unauthorized': 'Anda tidak memiliki akses untuk melakukan ini.',
  
  // Sync
  'sync_failed': 'Gagal menyinkron data. Akan dicoba lagi nanti.',
  'upload_failed': 'Gagal mengunggah struk. Silakan coba lagi.',
  
  // Validation
  'required_field': 'Field ini wajib diisi.',
  'invalid_amount': 'Jumlah tidak valid.',
  'receipt_required': 'Struk wajib dilampirkan untuk pengeluaran > Rp 500.000.',
  
  // Generic
  'unknown': 'Terjadi kesalahan. Silakan coba lagi.'
}

export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES['unknown']
}
```

## Accessibility

### Focus Management
```typescript
// hooks/use-focus-trap.ts
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return
    
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()
    
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive])
  
  return containerRef
}
```

## Testing Checklist

### Device Testing
- [ ] Android Chrome
- [ ] Android Samsung Internet
- [ ] iOS Safari
- [ ] iOS Chrome
- [ ] Desktop Chrome
- [ ] Desktop Firefox

### Scenario Testing
- [ ] First-time user flow
- [ ] Offline capture and sync
- [ ] Slow 3G network
- [ ] Large image upload
- [ ] Multiple expenses batch
- [ ] Approval workflow

### Performance Testing
- [ ] Lighthouse audit
- [ ] Core Web Vitals
- [ ] Bundle size analysis
- [ ] Memory usage
