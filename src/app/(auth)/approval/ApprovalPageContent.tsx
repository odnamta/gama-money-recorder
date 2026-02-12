'use client'

import { ClipboardCheck } from 'lucide-react'
import { ApprovalList } from '@/components/approval/ApprovalList'

interface ApprovalPageContentProps {
  userName?: string
}

/**
 * ApprovalPageContent - Client component for approval page
 */
export function ApprovalPageContent({ userName }: ApprovalPageContentProps) {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ClipboardCheck className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Persetujuan</h1>
            {userName && (
              <p className="text-sm text-slate-500">Halo, {userName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        <ApprovalList />
      </div>
    </div>
  )
}
