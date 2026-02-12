'use client'

import { InstallPromptSettings } from '@/components/pwa'

export function InstallSection() {
  return (
    <section className="bg-white rounded-lg border">
      <div className="px-4 py-3 border-b">
        <h2 className="font-semibold">Aplikasi</h2>
      </div>
      <div className="p-4">
        <InstallPromptSettings />
      </div>
    </section>
  )
}
