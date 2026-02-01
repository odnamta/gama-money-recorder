'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Filter, WifiOff, RefreshCw, Loader2 } from 'lucide-react'
import { useExpenses } from '@/hooks/use-expenses'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh'
import { Button } from '@/components/ui/button'
import {
  ExpenseList,
  SearchInput,
  FilterSheet,
  SummaryCard,
  ExpenseDetailSheet,
  countByCategory,
} from '@/components/history'
import type { ExpenseFilters, DisplayExpense } from '@/types/expense-filters'
import { cn } from '@/lib/utils/cn'

/** Number of items to show per page */
const PAGE_SIZE = 20

export default function HistoryPage() {
  // Filter state
  const [filters, setFilters] = useState<ExpenseFilters>({})
  const [searchValue, setSearchValue] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Pagination state
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Detail sheet state
  const [selectedExpense, setSelectedExpense] = useState<DisplayExpense | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Online status
  const isOnline = useOnlineStatus()

  // Combine search with other filters
  const combinedFilters = useMemo<ExpenseFilters>(
    () => ({
      ...filters,
      search: searchValue || undefined,
    }),
    [filters, searchValue]
  )

  // Fetch expenses with filters
  const { expenses, isLoading, refresh, totalCount } = useExpenses(combinedFilters)

  // Paginated expenses
  const visibleExpenses = useMemo(
    () => expenses.slice(0, visibleCount),
    [expenses, visibleCount]
  )

  const hasMore = visibleCount < expenses.length

  // Calculate category counts for filter
  const categoryCounts = useMemo(() => countByCategory(expenses), [expenses])

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.dateFrom ||
      filters.dateTo ||
      (filters.categories && filters.categories.length > 0) ||
      (filters.syncStatuses && filters.syncStatuses.length > 0) ||
      (filters.approvalStatuses && filters.approvalStatuses.length > 0) ||
      searchValue
    )
  }, [filters, searchValue])

  // Count active filter groups
  const activeFilterCount = useMemo(() => {
    return [
      filters.dateFrom || filters.dateTo,
      filters.categories && filters.categories.length > 0,
      filters.syncStatuses && filters.syncStatuses.length > 0,
      filters.approvalStatuses && filters.approvalStatuses.length > 0,
    ].filter(Boolean).length
  }, [filters])

  // Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    await new Promise<void>((resolve) => {
      refresh()
      // Give time for the refresh to complete
      setTimeout(resolve, 500)
    })
  }, [refresh])

  const { isRefreshing, pullDistance, containerProps } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  })

  /**
   * Handle expense item click
   */
  const handleExpenseClick = (expense: DisplayExpense) => {
    setSelectedExpense(expense)
    setIsDetailOpen(true)
  }

  /**
   * Load more items
   */
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE)
  }

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [combinedFilters])

  return (
    <div className="min-h-screen bg-slate-50" {...containerProps}>
      {/* Pull-to-refresh indicator */}
      <div
        className={cn(
          'fixed top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-20 bg-slate-50',
          pullDistance > 0 || isRefreshing ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          height: isRefreshing ? 48 : Math.min(pullDistance, 48),
          paddingTop: isRefreshing ? 12 : Math.max(0, pullDistance - 36),
        }}
      >
        <Loader2
          className={cn(
            'h-5 w-5 text-blue-600',
            isRefreshing && 'animate-spin'
          )}
        />
      </div>

      {/* Header */}
      <div
        className="bg-white border-b border-slate-100 sticky top-0 z-10 transition-transform"
        style={{
          transform: `translateY(${isRefreshing ? 48 : Math.min(pullDistance, 48)}px)`,
        }}
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Riwayat</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {totalCount} pengeluaran
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refresh()}
              disabled={isLoading || isRefreshing}
              className="text-slate-600"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Offline Indicator */}
          {!isOnline && (
            <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <WifiOff className="h-4 w-4 flex-shrink-0" />
              <span>Menampilkan data lokal (offline)</span>
            </div>
          )}

          {/* Search and Filter Row */}
          <div className="flex gap-2">
            <SearchInput
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Cari vendor atau catatan..."
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFilterOpen(true)}
              className="relative flex-shrink-0"
            >
              <Filter className="h-5 w-5" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="px-4 py-4 space-y-4 transition-transform"
        style={{
          transform: `translateY(${isRefreshing ? 48 : Math.min(pullDistance, 48)}px)`,
        }}
      >
        {/* Summary Card */}
        <SummaryCard expenses={expenses} isLoading={isLoading} />

        {/* Expense List */}
        <ExpenseList
          expenses={visibleExpenses}
          isLoading={isLoading}
          onExpenseClick={handleExpenseClick}
          searchTerm={searchValue}
          hasFilters={hasActiveFilters}
        />

        {/* Load More Button */}
        {hasMore && !isLoading && (
          <div className="flex justify-center pt-2 pb-4">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              className="w-full max-w-xs"
            >
              Muat Lebih Banyak ({expenses.length - visibleCount} lagi)
            </Button>
          </div>
        )}
      </div>

      {/* Filter Sheet */}
      <FilterSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        onFiltersChange={setFilters}
        categoryCounts={categoryCounts}
      />

      {/* Detail Sheet */}
      <ExpenseDetailSheet
        expense={selectedExpense}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}
