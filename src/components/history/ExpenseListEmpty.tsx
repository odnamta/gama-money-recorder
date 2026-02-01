'use client'

import { History, Search } from 'lucide-react'

interface ExpenseListEmptyProps {
  /** Whether filters are currently active */
  hasFilters?: boolean
}

/**
 * ExpenseListEmpty - Empty state for expense list
 *
 * Shows different messages based on whether filters are active.
 */
export function ExpenseListEmpty({ hasFilters = false }: ExpenseListEmptyProps) {
  if (hasFilters) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
        <div className="mx-auto h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">Tidak Ada Hasil</p>
        <p className="text-sm text-slate-500 mt-2">
          Coba ubah filter atau kata kunci pencarian
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
      <div className="mx-auto h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <History className="h-8 w-8 text-slate-400" />
      </div>
      <p className="text-slate-600 font-medium">Belum Ada Riwayat</p>
      <p className="text-sm text-slate-500 mt-2">
        Pengeluaran yang Anda catat akan muncul di sini
      </p>
    </div>
  )
}
