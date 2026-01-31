'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ShieldX } from 'lucide-react'

export default function AccessDeniedPage() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="text-center space-y-6 max-w-sm">
        <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
          <ShieldX className="h-10 w-10 text-red-600" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Akses Ditolak</h1>
          <p className="mt-2 text-slate-600">
            Maaf, Anda tidak memiliki izin untuk mengakses aplikasi ini.
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 text-sm text-slate-600">
          <p>
            Hubungi administrator jika Anda merasa ini adalah kesalahan.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-slate-900 text-white rounded-lg px-4 py-3 font-medium hover:bg-slate-800 transition-colors"
        >
          Kembali ke Login
        </button>
      </div>
    </div>
  )
}
