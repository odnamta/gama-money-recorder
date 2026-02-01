'use client'

import { cn } from '@/lib/utils/cn'

type UserRole = 
  | 'owner' 
  | 'director' 
  | 'finance_manager' 
  | 'operations_manager' 
  | 'finance' 
  | 'ops' 
  | 'operations' 
  | 'engineer'

interface RoleBadgeProps {
  role?: string | null
  className?: string
}

/**
 * Role configuration with labels and colors
 */
const ROLE_CONFIG: Record<UserRole, { label: string; color: string }> = {
  owner: {
    label: 'Pemilik',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  director: {
    label: 'Direktur', 
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  finance_manager: {
    label: 'Manajer Keuangan',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  operations_manager: {
    label: 'Manajer Operasi',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  finance: {
    label: 'Keuangan',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  ops: {
    label: 'Operasi',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  operations: {
    label: 'Operasi',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  engineer: {
    label: 'Engineer',
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Badge component showing user role
 */
export function RoleBadge({ role, className }: RoleBadgeProps) {
  if (!role) {
    return (
      <span className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
        'bg-gray-100 text-gray-600 border-gray-200',
        className
      )}>
        Tidak Diketahui
      </span>
    )
  }

  const config = ROLE_CONFIG[role as UserRole]
  if (!config) {
    return (
      <span className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
        'bg-gray-100 text-gray-600 border-gray-200',
        className
      )}>
        {role}
      </span>
    )
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
      config.color,
      className
    )}>
      {config.label}
    </span>
  )
}