'use client'

import { History, Search, WifiOff } from 'lucide-react'
import { useLocalExpenses } from '@/hooks/use-local-expenses'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { SyncStatusBadge } from '@/components/offline'
import { formatCurrency } from '@/lib/utils/format-currency'
import { formatDate } from '@/lib/utils/format-date'
import { EXPENSE_CATEGORIES } from '@/constants/expense-categories'

export default function HistoryPage() {
  const { expenses, isLoading } = useLocalExpenses()
  const isOnline = useOnlineStatus()

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Riwayat</h1>
        <p className="text-sm text-slate-500 mt-1">
          Lihat semua pengeluaran Anda
        </p>
      </div>

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <WifiOff className="h-4 w-4 flex-shrink-0" />
          <span>Menampilkan data lokal (offline)</span>
        </div>
      )}

      {/* Search Bar Placeholder */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari pengeluaran..."
          disabled
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 disabled:opacity-50"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-500">Memuat...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && expenses.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="mx-auto h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <History className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">Belum Ada Riwayat</p>
          <p className="text-sm text-slate-500 mt-2">
            Pengeluaran yang Anda catat akan muncul di sini
          </p>
        </div>
      )}

      {/* Expense List */}
      {!isLoading && expenses.length > 0 && (
        <div className="space-y-3">
          {expenses.map((expense) => {
            const categoryConfig = EXPENSE_CATEGORIES[expense.category]
            return (
              <div
                key={expense.id}
                className="bg-white rounded-xl border border-slate-100 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(expense.amount)}
                      </span>
                      <SyncStatusBadge status={expense.syncStatus} compact />
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {categoryConfig?.label || expense.category}
                      {expense.vendorName && ` - ${expense.vendorName}`}
                    </p>
                    {expense.description && (
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {expense.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    {formatDate(expense.expenseDate, 'short')}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
