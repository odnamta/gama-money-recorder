import { createClient } from '@/lib/supabase/server'
import { generateBKKNumber } from './bkk-generator'

/**
 * BKK Service
 * 
 * Handles BKK (Bukti Kas Keluar) record creation and management
 * for integration with GAMA ERP system.
 */

export interface CreateBKKInput {
  expenseId: string
  amount: number
  description: string
  vendorId?: string
  jobOrderId?: string
  receiptPath?: string
  expenseDate: string
  category: string
}

export interface BKKRecord {
  id: string
  record_number: string
  record_date: string
  amount: number
  description: string
  vendor_id?: string
  job_order_id?: string
  receipt_path?: string
  status: 'draft' | 'pending' | 'approved' | 'paid'
  source_expense_id: string
  created_by: string
  created_at: string
}

/**
 * Create a new BKK record from an expense
 */
export async function createBKKRecord(input: CreateBKKInput): Promise<string> {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  // Generate BKK number
  const bkkNumber = await generateBKKNumber()

  // Build description with category prefix
  const categoryLabels: Record<string, string> = {
    fuel: 'BBM',
    toll: 'Tol',
    parking: 'Parkir',
    food: 'Makan',
    lodging: 'Penginapan',
    transport: 'Transport',
    supplies: 'Perlengkapan',
    other: 'Lainnya',
  }
  const categoryLabel = categoryLabels[input.category] || input.category
  const fullDescription = input.description 
    ? `[${categoryLabel}] ${input.description}`
    : `[${categoryLabel}] Pengeluaran operasional`

  // Create BKK record
  const { data, error } = await supabase
    .from('bkk_records')
    .insert({
      record_number: bkkNumber,
      record_date: input.expenseDate,
      amount: input.amount,
      description: fullDescription,
      vendor_id: input.vendorId || null,
      job_order_id: input.jobOrderId || null,
      receipt_path: input.receiptPath || null,
      status: 'draft',
      source_expense_id: input.expenseId,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create BKK record: ${error.message}`)
  }

  return data.id
}

/**
 * Get BKK record by ID
 */
export async function getBKKRecord(bkkId: string): Promise<BKKRecord | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('bkk_records')
    .select('*')
    .eq('id', bkkId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw new Error(`Failed to get BKK record: ${error.message}`)
  }

  return data as BKKRecord
}

/**
 * Update BKK record status
 */
export async function updateBKKStatus(
  bkkId: string, 
  status: BKKRecord['status']
): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('bkk_records')
    .update({ status })
    .eq('id', bkkId)

  if (error) {
    throw new Error(`Failed to update BKK status: ${error.message}`)
  }
}
