import { NextRequest, NextResponse } from 'next/server'
import { rejectExpense } from '@/lib/erp/approval-service'

/**
 * POST /api/expenses/[id]/reject
 * Reject an expense with reason (finance role only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Expense ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { reason } = body

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    const result = await rejectExpense(id, reason)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
