import { ProfileSection } from '@/components/settings/ProfileSection'
import { SyncSection } from '@/components/settings/SyncSection'
import { PendingSyncSection } from '@/components/settings/PendingSyncSection'
import { StorageSection } from '@/components/settings/StorageSection'
import { AppInfoSection } from '@/components/settings/AppInfoSection'
import { LogoutSection } from '@/components/settings/LogoutSection'

/**
 * Settings page
 * User preferences, sync settings, storage management, and logout
 */
export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold">Pengaturan</h1>
      </div>
      
      {/* Content */}
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

export const metadata = {
  title: 'Pengaturan - GAMA Money Recorder',
  description: 'Kelola pengaturan aplikasi, sinkronisasi, dan penyimpanan'
}