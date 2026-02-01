'use client'

import { useState, useEffect } from 'react'
import { Filter } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DateRangeFilter } from './DateRangeFilter'
import { CategoryFilter } from './CategoryFilter'
import { StatusFilter } from './StatusFilter'
import type { ExpenseFilters } from '@/types/expense-filters'
import type { ExpenseCategory } from '@/constants/expense-categories'

interface FilterSheetProps {
  /** Whether the sheet is open */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
  /** Current filter values */
  filters: ExpenseFilters
  /** Callback when filters are applied */
  onFiltersChange: (filters: ExpenseFilters) => void
  /** Optional category counts */
  categoryCounts?: Record<ExpenseCategory, number>
}

/**
 * FilterSheet - Bottom sheet with all filter options
 *
 * Contains:
 * - Date range filter with quick filters
 * - Category multi-select filter
 * - Sync and approval status filters
 * - Apply and clear buttons
 */
export function FilterSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  categoryCounts,
}: FilterSheetProps) {
  // Local state for filters (applied on "Apply" button click)
  const [localFilters, setLocalFilters] = useState<ExpenseFilters>(filters)

  // Sync local filters when external filters change
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  /**
   * Apply filters and close sheet
   */
  const handleApply = () => {
    onFiltersChange(localFilters)
    onOpenChange(false)
  }

  /**
   * Clear all filters and close sheet
   */
  const handleClear = () => {
    const emptyFilters: ExpenseFilters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
    onOpenChange(false)
  }

  /**
   * Count active filters
   */
  const activeFilterCount = [
    localFilters.dateFrom || localFilters.dateTo,
    localFilters.categories && localFilters.categories.length > 0,
    localFilters.syncStatuses && localFilters.syncStatuses.length > 0,
    localFilters.approvalStatuses && localFilters.approvalStatuses.length > 0,
  ].filter(Boolean).length

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl" showCloseButton={false}>
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter
              {activeFilterCount > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-slate-500"
            >
              Tutup
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 py-4">
          <div className="space-y-6 px-1">
            {/* Date Range Filter */}
            <DateRangeFilter
              value={{
                dateFrom: localFilters.dateFrom,
                dateTo: localFilters.dateTo,
              }}
              onChange={(dateFilters) =>
                setLocalFilters((f) => ({
                  ...f,
                  dateFrom: dateFilters.dateFrom,
                  dateTo: dateFilters.dateTo,
                }))
              }
            />

            {/* Category Filter */}
            <CategoryFilter
              selected={localFilters.categories || []}
              onChange={(categories) =>
                setLocalFilters((f) => ({
                  ...f,
                  categories: categories.length > 0 ? categories : undefined,
                }))
              }
              counts={categoryCounts}
            />

            {/* Status Filter */}
            <StatusFilter
              syncStatuses={localFilters.syncStatuses || []}
              approvalStatuses={localFilters.approvalStatuses || []}
              onSyncStatusChange={(statuses) =>
                setLocalFilters((f) => ({
                  ...f,
                  syncStatuses: statuses.length > 0 ? statuses : undefined,
                }))
              }
              onApprovalStatusChange={(statuses) =>
                setLocalFilters((f) => ({
                  ...f,
                  approvalStatuses: statuses.length > 0 ? statuses : undefined,
                }))
              }
            />
          </div>
        </ScrollArea>

        <SheetFooter className="border-t pt-4 flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1"
            disabled={activeFilterCount === 0}
          >
            Hapus Filter
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Terapkan
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
