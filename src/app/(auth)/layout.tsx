import { BottomNav } from '@/components/navigation/BottomNav'
import { JobCacheInitializer } from '@/components/providers/JobCacheInitializer'
import { SyncNotificationProvider } from '@/components/providers/SyncNotificationProvider'
import { OfflineIndicator } from '@/components/offline'
import { InstallBanner } from '@/components/pwa'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <JobCacheInitializer>
      <SyncNotificationProvider>
        <OfflineIndicator />
        <div className="min-h-screen bg-slate-50">
          <main className="pb-20">
            {children}
          </main>
          <BottomNav />
          <InstallBanner />
        </div>
      </SyncNotificationProvider>
    </JobCacheInitializer>
  )
}
