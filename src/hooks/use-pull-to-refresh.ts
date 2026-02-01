'use client'

import { useState, useCallback, useRef } from 'react'

interface UsePullToRefreshOptions {
  /** Callback to execute on refresh */
  onRefresh: () => Promise<void> | void
  /** Minimum pull distance to trigger refresh (default: 80) */
  threshold?: number
  /** Whether pull-to-refresh is enabled (default: true) */
  enabled?: boolean
}

interface UsePullToRefreshReturn {
  /** Whether currently refreshing */
  isRefreshing: boolean
  /** Current pull distance (0 when not pulling) */
  pullDistance: number
  /** Props to spread on the container element */
  containerProps: {
    onTouchStart: (e: React.TouchEvent) => void
    onTouchMove: (e: React.TouchEvent) => void
    onTouchEnd: () => void
  }
}

/**
 * usePullToRefresh - Hook for implementing pull-to-refresh functionality
 *
 * @param options - Configuration options
 * @returns Object with refresh state and container props
 *
 * @example
 * ```tsx
 * function MyList() {
 *   const { isRefreshing, pullDistance, containerProps } = usePullToRefresh({
 *     onRefresh: async () => {
 *       await fetchData()
 *     }
 *   })
 *
 *   return (
 *     <div {...containerProps}>
 *       {isRefreshing && <RefreshIndicator />}
 *       <List />
 *     </div>
 *   )
 * }
 * ```
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  enabled = true,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startYRef = useRef<number | null>(null)
  const isPullingRef = useRef(false)

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || isRefreshing) return

      // Only start pull if at top of scroll
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      if (scrollTop <= 0) {
        startYRef.current = e.touches[0].clientY
        isPullingRef.current = true
      }
    },
    [enabled, isRefreshing]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || isRefreshing || !isPullingRef.current || startYRef.current === null) {
        return
      }

      const currentY = e.touches[0].clientY
      const diff = currentY - startYRef.current

      // Only track downward pulls
      if (diff > 0) {
        // Apply resistance to make it feel natural
        const resistance = 0.5
        const distance = Math.min(diff * resistance, threshold * 1.5)
        setPullDistance(distance)
      }
    },
    [enabled, isRefreshing, threshold]
  )

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || isRefreshing || !isPullingRef.current) return

    isPullingRef.current = false
    startYRef.current = null

    if (pullDistance >= threshold) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }

    setPullDistance(0)
  }, [enabled, isRefreshing, pullDistance, threshold, onRefresh])

  return {
    isRefreshing,
    pullDistance,
    containerProps: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}
