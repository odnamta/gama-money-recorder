'use client'

import { cn } from '@/lib/utils/cn'

/**
 * Skeleton item for loading state
 */
function SkeletonItem() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-3 animate-pulse">
      {/* Icon skeleton */}
      <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />

      {/* Content skeleton */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-4 w-4 bg-slate-200 rounded-full" />
        </div>
        <div className="h-3 w-32 bg-slate-100 rounded" />
      </div>

      {/* Amount skeleton */}
      <div className="text-right flex-shrink-0 space-y-1">
        <div className="h-5 w-20 bg-slate-200 rounded" />
        <div className="h-3 w-12 bg-slate-100 rounded ml-auto" />
      </div>

      {/* Chevron skeleton */}
      <div className="h-4 w-4 bg-slate-100 rounded flex-shrink-0" />
    </div>
  )
}

interface ExpenseListSkeletonProps {
  /** Number of skeleton items to show */
  count?: number
  /** Additional CSS classes */
  className?: string
}

/**
 * ExpenseListSkeleton - Loading skeleton for expense list
 *
 * Shows placeholder items while expenses are being loaded.
 */
export function ExpenseListSkeleton({
  count = 5,
  className,
}: ExpenseListSkeletonProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} />
      ))}
    </div>
  )
}
