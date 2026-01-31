'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { User, LogOut, ChevronRight, Shield, Bell, HelpCircle } from 'lucide-react'
import type { UserProfile } from '@/types/supabase'

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfile(data)
      }
    }

    fetchProfile()
  }, [])

  const handleLogout = async () => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const menuItems = [
    { icon: User, label: 'Profil', href: '#', disabled: true },
    { icon: Bell, label: 'Notifikasi', href: '#', disabled: true },
    { icon: Shield, label: 'Keamanan', href: '#', disabled: true },
    { icon: HelpCircle, label: 'Bantuan', href: '#', disabled: true },
  ]

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Pengaturan</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-primary rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-white">
              {profile?.full_name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 truncate">
              {profile?.full_name || 'Loading...'}
            </p>
            <p className="text-sm text-slate-500 truncate">
              {profile?.email}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full capitalize">
              {profile?.role?.replace('_', ' ') || 'User'}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y divide-slate-100">
        {menuItems.map(({ icon: Icon, label, disabled }) => (
          <button
            key={label}
            disabled={disabled}
            className="w-full flex items-center justify-between p-4 text-left disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-slate-500" />
              <span className="text-slate-900">{label}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 rounded-xl p-4 font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <div className="h-5 w-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
        ) : (
          <LogOut className="h-5 w-5" />
        )}
        <span>{isLoading ? 'Keluar...' : 'Keluar'}</span>
      </button>

      {/* App Version */}
      <p className="text-center text-xs text-slate-400">
        GAMA Money Recorder v0.1.0
      </p>
    </div>
  )
}
