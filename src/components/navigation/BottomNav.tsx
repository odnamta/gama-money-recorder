'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Camera, History, Settings } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Beranda' },
  { href: '/capture', icon: Camera, label: 'Catat' },
  { href: '/history', icon: History, label: 'Riwayat' },
  { href: '/settings', icon: Settings, label: 'Pengaturan' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full',
                'text-xs font-medium transition-colors',
                'active:scale-95 touch-manipulation',
                isActive 
                  ? 'text-primary' 
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon 
                className={cn(
                  'h-6 w-6 mb-1 transition-colors',
                  isActive && 'stroke-[2.5px]'
                )} 
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
