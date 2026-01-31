import { Camera } from 'lucide-react'

export default function CapturePage() {
  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Catat Pengeluaran</h1>
        <p className="text-sm text-slate-500 mt-1">
          Foto struk atau isi manual
        </p>
      </div>

      {/* Placeholder */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
        <div className="mx-auto h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Camera className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">Coming Soon</p>
        <p className="text-sm text-slate-500 mt-2">
          Fitur ini akan tersedia di v0.2
        </p>
      </div>
    </div>
  )
}
