'use client'

import { useUser } from '@/hooks/use-user'
import { UserAvatar } from './UserAvatar'
import { RoleBadge } from './RoleBadge'

/**
 * Profile section showing user info and role
 */
export function ProfileSection() {
  const { user, profile, isLoading } = useUser()

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-slate-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-2/3 animate-pulse" />
            <div className="h-6 bg-slate-200 rounded w-20 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg p-4">
        <p className="text-center text-muted-foreground">
          Tidak dapat memuat profil pengguna
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center gap-4">
        <UserAvatar 
          user={user}
          size="lg"
        />
        <div className="flex-1">
          <h2 className="font-semibold text-lg">
            {user.user_metadata?.full_name || 'Pengguna'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {user.email}
          </p>
          <div className="mt-2">
            <RoleBadge role={profile?.role} />
          </div>
        </div>
      </div>
    </div>
  )
}