import { BottomNav } from '@/components/navigation/BottomNav'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
