'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Camera, History, Settings, ClipboardCheck } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUser } from '@/hooks/use-user'
import { usePendingCount } from '@/hooks/use-pending-count'

const baseNavItems = [
  { href: '/dashboard', icon: Home, label: 'Beranda' },
  { href: '/capture', icon: Camera, label: 'Catat' },
  { href: '/history', icon: History, label: 'Riwayat' },
  { href: '/settings', icon: Settings, label: 'Pengaturan' },
]

const approvalNavItem = { href: '/approval', icon: ClipboardCheck, label: 'Setujui' }

// Roles that can access approval page
const APPROVAL_ROLES = ['owner', 'director', 'finance_manager']

export function BottomNav() {
  const pathname = usePathname()
  const { profile } = useUser()
  const { count: pendingCount } = usePendingCount()

  // Check if user has approval access
  const hasApprovalAccess = profile?.role && APPROVAL_ROLES.includes(profile.role)

  // Build nav items based on role
  const navItems = hasApprovalAccess
    ? [baseNavItems[0], baseNavItems[1], approvalNavItem, baseNavItems[2], baseNavItems[3]]
    : baseNavItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          const showBadge = href === '/approval' && pendingCount > 0
          
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full relative',
                'text-xs font-medium transition-colors',
                'active:scale-95 touch-manipulation',
                isActive 
                  ? 'text-primary' 
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    'h-6 w-6 mb-1 transition-colors',
                    isActive && 'stroke-[2.5px]'
                  )} 
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </span>
                )}
              </div>
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
