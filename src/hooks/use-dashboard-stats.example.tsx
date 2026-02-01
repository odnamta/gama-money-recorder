/**
 * Example usage of useDashboardStats hook
 * 
 * This file demonstrates how to use the useDashboardStats hook
 * in a dashboard component. This is not part of the application,
 * just documentation.
 */

import { useDashboardStats } from './use-dashboard-stats'
import { formatCurrency } from '@/lib/utils/format-currency'

export function DashboardStatsExample() {
  const { stats, isLoading, error, refresh } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-lg">
        <p>Gagal memuat statistik: {error.message}</p>
        <button onClick={refresh} className="mt-2 underline">
          Coba Lagi
        </button>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {/* Today */}
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-slate-600 mb-1">Hari Ini</p>
          <p className="text-xl font-bold text-blue-700">
            {formatCurrency(stats.today.total, { compact: true })}
          </p>
          <p className="text-xs text-slate-500">{stats.today.count} transaksi</p>
        </div>

        {/* This Week */}
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-slate-600 mb-1">Minggu Ini</p>
          <p className="text-xl font-bold text-green-700">
            {formatCurrency(stats.week.total, { compact: true })}
          </p>
          <p className="text-xs text-slate-500">{stats.week.count} transaksi</p>
        </div>

        {/* This Month */}
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-slate-600 mb-1">Bulan Ini</p>
          <p className="text-xl font-bold text-purple-700">
            {formatCurrency(stats.month.total, { compact: true })}
          </p>
          <p className="text-xs text-slate-500">{stats.month.count} transaksi</p>
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={refresh}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        Refresh Statistik
      </button>
    </div>
  )
}
