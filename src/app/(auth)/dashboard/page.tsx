import { createClient } from '@/lib/supabase/server'
import { Wallet, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, role')
    .eq('id', user?.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] || 'User'

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <p className="text-slate-500 text-sm">Selamat datang,</p>
        <h1 className="text-2xl font-bold text-slate-900">{firstName} 👋</h1>
      </div>

      {/* Quick Action */}
      <Link
        href="/capture"
        className="block bg-primary text-white rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/80 text-sm">Catat Pengeluaran</p>
            <p className="text-xl font-semibold mt-1">Tambah Baru</p>
          </div>
          <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
            <Wallet className="h-6 w-6" />
          </div>
        </div>
      </Link>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Bulan Ini</span>
          </div>
          <p className="text-lg font-semibold text-slate-900">Rp 0</p>
          <p className="text-xs text-slate-500 mt-1">0 transaksi</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Pending Sync</span>
          </div>
          <p className="text-lg font-semibold text-slate-900">0</p>
          <p className="text-xs text-slate-500 mt-1">Semua tersinkron</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Aktivitas Terakhir</h2>
          <Link 
            href="/history" 
            className="text-sm text-primary flex items-center gap-1"
          >
            Lihat Semua
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="p-8 text-center text-slate-500">
          <p className="text-sm">Belum ada pengeluaran</p>
          <p className="text-xs mt-1">Mulai catat pengeluaran pertama Anda</p>
        </div>
      </div>
    </div>
  )
}
