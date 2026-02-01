# v0.9 ERP Integration - Technical Design

## Overview
Implement BKK record creation, approval workflow, and status tracking for expense integration with GAMA ERP.

## Component Architecture

```
/approval (new route for finance)
├── ApprovalPage (page)
│   ├── ApprovalHeader (organism)
│   │   ├── PendingCount (atom)
│   │   └── FilterTabs (molecule)
│   ├── ApprovalList (organism)
│   │   └── ApprovalItem (molecule)
│   └── ApprovalDetailSheet (organism)
│       ├── ExpenseDetails (molecule)
│       ├── ReceiptViewer (molecule)
│       └── ApprovalActions (molecule)

/history (enhanced)
├── ExpenseDetailSheet (enhanced)
│   ├── ApprovalStatus (molecule)
│   ├── SubmitButton (atom)
│   └── RejectionInfo (molecule)
```

## Data Layer

### BKK Record Creation
```typescript
// lib/erp/bkk-records.ts
interface CreateBKKInput {
  expenseId: string
  amount: number
  description: string
  vendorId?: string
  jobOrderId?: string
  receiptPath?: string
  expenseDate: string
}

export async function createBKKRecord(input: CreateBKKInput): Promise<string> {
  const supabase = await createClient()
  
  // Generate BKK number
  const bkkNumber = await generateBKKNumber()
  
  const { data, error } = await supabase
    .from('bkk_records')
    .insert({
      record_number: bkkNumber,
      record_date: input.expenseDate,
      amount: input.amount,
      description: input.description,
      vendor_id: input.vendorId,
      job_order_id: input.jobOrderId,
      receipt_path: input.receiptPath,
      status: 'draft',
      source_expense_id: input.expenseId,
      created_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select('id')
    .single()
  
  if (error) throw error
  return data.id
}

async function generateBKKNumber(): Promise<string> {
  const supabase = await createClient()
  const now = new Date()
  const prefix = `BKK-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  
  // Get last number for this month
  const { data } = await supabase
    .from('bkk_records')
    .select('record_number')
    .like('record_number', `${prefix}%`)
    .order('record_number', { ascending: false })
    .limit(1)
  
  let sequence = 1
  if (data && data.length > 0) {
    const lastNum = parseInt(data[0].record_number.split('-')[2], 10)
    sequence = lastNum + 1
  }
  
  return `${prefix}-${String(sequence).padStart(4, '0')}`
}
```

### Submit for Approval
```typescript
// lib/erp/approval.ts
export async function submitForApproval(expenseId: string): Promise<void> {
  const supabase = await createClient()
  
  // Get expense details
  const { data: expense, error: fetchError } = await supabase
    .from('expense_drafts')
    .select('*, receipt:expense_receipts(storage_path)')
    .eq('id', expenseId)
    .single()
  
  if (fetchError) throw fetchError
  
  // Create BKK record if not exists
  if (!expense.bkk_record_id) {
    const bkkId = await createBKKRecord({
      expenseId: expense.id,
      amount: expense.amount,
      description: expense.description || `${expense.category} expense`,
      vendorId: expense.vendor_id,
      jobOrderId: expense.job_order_id,
      receiptPath: expense.receipt?.storage_path,
      expenseDate: expense.expense_date
    })
    
    // Link BKK to expense
    await supabase
      .from('expense_drafts')
      .update({ bkk_record_id: bkkId })
      .eq('id', expenseId)
  }
  
  // Update approval status
  const { error: updateError } = await supabase
    .from('expense_drafts')
    .update({ approval_status: 'pending_approval' })
    .eq('id', expenseId)
  
  if (updateError) throw updateError
}

export async function batchSubmitForApproval(expenseIds: string[]): Promise<void> {
  for (const id of expenseIds) {
    await submitForApproval(id)
  }
}
```

### Approval Actions
```typescript
// lib/erp/approval-actions.ts
export async function approveExpense(expenseId: string): Promise<void> {
  const supabase = await createClient()
  const user = (await supabase.auth.getUser()).data.user
  
  const { error } = await supabase
    .from('expense_drafts')
    .update({
      approval_status: 'approved',
      approved_by: user?.id,
      approved_at: new Date().toISOString()
    })
    .eq('id', expenseId)
  
  if (error) throw error
  
  // Update BKK record status
  const { data: expense } = await supabase
    .from('expense_drafts')
    .select('bkk_record_id')
    .eq('id', expenseId)
    .single()
  
  if (expense?.bkk_record_id) {
    await supabase
      .from('bkk_records')
      .update({ status: 'approved' })
      .eq('id', expense.bkk_record_id)
  }
}

export async function rejectExpense(expenseId: string, reason: string): Promise<void> {
  const supabase = await createClient()
  const user = (await supabase.auth.getUser()).data.user
  
  const { error } = await supabase
    .from('expense_drafts')
    .update({
      approval_status: 'rejected',
      approved_by: user?.id,
      approved_at: new Date().toISOString(),
      rejection_reason: reason
    })
    .eq('id', expenseId)
  
  if (error) throw error
}
```

## Components

### Submit Button
```typescript
// components/approval/SubmitButton.tsx
interface SubmitButtonProps {
  expenseId: string
  currentStatus: ApprovalStatus
  syncStatus: SyncStatus
  onSubmit: () => void
}

export function SubmitButton({ expenseId, currentStatus, syncStatus, onSubmit }: SubmitButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Can only submit synced drafts
  const canSubmit = syncStatus === 'synced' && currentStatus === 'draft'
  
  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await submitForApproval(expenseId)
      toast.success('Diajukan untuk persetujuan')
      onSubmit()
    } catch (error) {
      toast.error('Gagal mengajukan')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (!canSubmit) return null
  
  return (
    <Button onClick={handleSubmit} disabled={isSubmitting}>
      {isSubmitting ? 'Mengajukan...' : 'Ajukan Persetujuan'}
    </Button>
  )
}
```

### Approval List (Finance)
```typescript
// components/approval/ApprovalList.tsx
export function ApprovalList() {
  const { expenses, isLoading } = usePendingApprovals()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  
  return (
    <div className="space-y-2">
      {isLoading ? (
        <ApprovalListSkeleton />
      ) : expenses.length === 0 ? (
        <EmptyState message="Tidak ada yang perlu disetujui" />
      ) : (
        expenses.map(expense => (
          <ApprovalItem
            key={expense.id}
            expense={expense}
            onClick={() => setSelectedId(expense.id)}
          />
        ))
      )}
      
      <ApprovalDetailSheet
        expenseId={selectedId}
        open={!!selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
      />
    </div>
  )
}
```

### Approval Actions
```typescript
// components/approval/ApprovalActions.tsx
interface ApprovalActionsProps {
  expenseId: string
  onAction: () => void
}

export function ApprovalActions({ expenseId, onAction }: ApprovalActionsProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  
  const handleApprove = async () => {
    setIsApproving(true)
    try {
      await approveExpense(expenseId)
      toast.success('Disetujui')
      onAction()
    } catch (error) {
      toast.error('Gagal menyetujui')
    } finally {
      setIsApproving(false)
    }
  }
  
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Masukkan alasan penolakan')
      return
    }
    
    setIsRejecting(true)
    try {
      await rejectExpense(expenseId, rejectReason)
      toast.success('Ditolak')
      setShowRejectDialog(false)
      onAction()
    } catch (error) {
      toast.error('Gagal menolak')
    } finally {
      setIsRejecting(false)
    }
  }
  
  return (
    <div className="flex gap-2">
      <Button
        variant="destructive"
        onClick={() => setShowRejectDialog(true)}
        disabled={isApproving}
      >
        Tolak
      </Button>
      <Button
        onClick={handleApprove}
        disabled={isApproving || isRejecting}
      >
        {isApproving ? 'Menyetujui...' : 'Setujui'}
      </Button>
      
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Pengeluaran</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Alasan penolakan..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isRejecting}>
              {isRejecting ? 'Menolak...' : 'Tolak'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

## Approval Page
```typescript
// app/(auth)/approval/page.tsx
export default function ApprovalPage() {
  const { profile } = useUser()
  
  // Only finance roles can access
  if (!profile || !['finance_manager', 'owner', 'director'].includes(profile.role)) {
    redirect('/dashboard')
  }
  
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b px-4 py-4">
        <h1 className="text-xl font-bold">Persetujuan</h1>
        <PendingCount />
      </div>
      
      <div className="px-4 py-4">
        <ApprovalList />
      </div>
    </div>
  )
}
```

## Testing Strategy

### Unit Tests
- BKK number generation
- Approval status transitions
- Permission checks

### Integration Tests
- Submit for approval flow
- Approve/reject flow
- BKK record creation

### E2E Tests
- Complete approval workflow
- Rejection and resubmit
- Batch operations
