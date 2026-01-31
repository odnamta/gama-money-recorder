'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/types/supabase'

interface UseUserReturn {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUser = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = createClient()
      
      // Get auth user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError) throw authError
      
      setUser(authUser)

      // Get profile if user exists
      if (authUser) {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError
        }

        setProfile(profileData)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()

    // Subscribe to auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await fetchUser()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    profile,
    isLoading,
    error,
    refetch: fetchUser,
  }
}
