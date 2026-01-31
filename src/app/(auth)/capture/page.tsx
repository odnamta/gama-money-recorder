import { createClient } from '@/lib/supabase/server'
import { getRecentVendors } from '@/lib/queries/vendors'
import { ExpenseCaptureForm } from '@/components/organisms/ExpenseCaptureForm'

export default async function CapturePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch recent vendors for suggestions
  const recentVendors = user ? await getRecentVendors(user.id) : []

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Catat Pengeluaran</h1>
        <p className="mt-1 text-sm text-slate-500">Isi detail pengeluaran</p>
      </div>

      {/* Form */}
      <ExpenseCaptureForm initialVendors={recentVendors} />
    </div>
  )
}
