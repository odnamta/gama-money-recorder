'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UsePendingCountResult {
  count: number
  isLoading: boolean
  refresh: () => Promise<void>
}

/**
 * Hook to get count of expenses pending approval
 * Used for badge display in navigation
 */
export function usePendingCount(): UsePendingCountResult {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCount = useCallback(async () => {
    try {
      const supabase = createClient()

      const { count: pendingCount, error } = await supabase
        .from('expense_drafts')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'pending_approval')

      if (!error && pendingCount !== null) {
        setCount(pendingCount)
      }
    } catch (error) {
      console.error('Failed to fetch pending count:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCount()

    // Refresh every 30 seconds
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [fetchCount])

  return { count, isLoading, refresh: fetchCount }
}
