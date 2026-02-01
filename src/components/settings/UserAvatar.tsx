'use client'

import { User } from '@supabase/supabase-js'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils/cn'

interface UserAvatarProps {
  user: User
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

/**
 * Get user initials from full name or email
 */
function getInitials(name?: string, email?: string): string {
  if (name) {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  
  if (email) {
    return email.charAt(0).toUpperCase()
  }
  
  return 'U'
}

/**
 * User avatar component with fallback to initials
 */
export function UserAvatar({ user, size = 'default', className }: UserAvatarProps) {
  const fullName = user.user_metadata?.full_name
  const avatarUrl = user.user_metadata?.avatar_url
  const initials = getInitials(fullName, user.email)

  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-10 w-10', 
    lg: 'h-16 w-16'
  }

  return (
    <Avatar 
      size={size}
      className={cn(sizeClasses[size], className)}
    >
      {avatarUrl && (
        <AvatarImage 
          src={avatarUrl} 
          alt={fullName || user.email || 'User avatar'}
        />
      )}
      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}