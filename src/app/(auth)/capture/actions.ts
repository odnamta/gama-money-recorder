'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { expenseFormSchema, type ExpenseFormData } from '@/lib/schemas/expense'

export type SaveExpenseResult =
  | { success: true; data: { id: string } }
  | { success: false; error: string }

export async function saveExpense(formData: ExpenseFormData): Promise<SaveExpenseResult> {
  try {
    // Validate input
    const validated = expenseFormSchema.parse(formData)

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Sesi tidak valid. Silakan login kembali.' }
    }

    // Insert expense draft
    const { data: expense, error: insertError } = await supabase
      .from('expense_drafts')
      .insert({
        user_id: user.id,
        amount: validated.amount,
        category: validated.category,
        vendor_name: validated.vendorName || null,
        vendor_id: validated.vendorId || null,
        description: validated.description || null,
        expense_date: validated.expenseDate.toISOString().split('T')[0],
        sync_status: 'synced',
        approval_status: 'draft',
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Failed to save expense:', insertError)
      return { success: false, error: 'Gagal menyimpan pengeluaran. Silakan coba lagi.' }
    }

    // Revalidate history page
    revalidatePath('/history')

    return { success: true, data: { id: expense.id } }
  } catch (error) {
    console.error('Unexpected error saving expense:', error)
    return { success: false, error: 'Terjadi kesalahan. Silakan coba lagi.' }
  }
}
