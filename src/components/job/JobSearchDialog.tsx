'use client'

import { useState, useCallback } from 'react'
import { Search, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useJobSearch } from '@/hooks/use-job-search'
import { cn } from '@/lib/utils/cn'
import type { JobOrder } from '@/types/supabase'

interface JobSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (job: JobOrder) => void
}

/**
 * Dialog component for searching and selecting job orders
 * 
 * Features:
 * - Search input with debounced search
 * - Loading state with spinner
 * - Empty state message
 * - Clickable job results showing job_number, customer_name, and route
 */
export function JobSearchDialog({
  open,
  onOpenChange,
  onSelect,
}: JobSearchDialogProps) {
  const [searchValue, setSearchValue] = useState('')
  const { jobs, isLoading, search, clearResults } = useJobSearch()

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchValue(value)
      search(value)
    },
    [search]
  )

  const handleSelect = useCallback(
    (job: JobOrder) => {
      onSelect(job)
      // Reset search state when dialog closes
      setSearchValue('')
      clearResults()
    },
    [onSelect, clearResults]
  )

  const handleOpenChange = useCallback(
    (open: boolean) => {
      onOpenChange(open)
      if (!open) {
        // Reset search state when dialog closes
        setSearchValue('')
        clearResults()
      }
    },
    [onOpenChange, clearResults]
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Pilih Job Order</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari nomor job atau customer..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-9"
            autoFocus
          />
        </div>

        {/* Results Area */}
        <ScrollArea className="flex-1 -mx-6 px-6 max-h-[50vh]">
          {isLoading ? (
            // Loading State
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : jobs.length === 0 ? (
            // Empty State
            <p className="text-center py-8 text-gray-500">
              {searchValue.length >= 2
                ? 'Tidak ada job order ditemukan'
                : 'Ketik minimal 2 karakter untuk mencari'}
            </p>
          ) : (
            // Results List
            <div className="space-y-2 py-2">
              {jobs.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => handleSelect(job)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border border-gray-200',
                    'hover:bg-gray-50 hover:border-gray-300',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                    'transition-colors'
                  )}
                >
                  <div className="font-medium text-gray-900">
                    {job.job_number}
                  </div>
                  <div className="text-sm text-gray-600">
                    {job.customer_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {job.origin} → {job.destination}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
