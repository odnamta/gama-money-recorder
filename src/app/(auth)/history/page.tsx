import { History, Search } from 'lucide-react'

export default function HistoryPage() {
  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Riwayat</h1>
        <p className="text-sm text-slate-500 mt-1">
          Lihat semua pengeluaran Anda
        </p>
      </div>

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

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
        <div className="mx-auto h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <History className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">Belum Ada Riwayat</p>
        <p className="text-sm text-slate-500 mt-2">
          Pengeluaran yang Anda catat akan muncul di sini
        </p>
      </div>
    </div>
  )
}
