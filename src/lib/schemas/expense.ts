import { z } from 'zod'

export const EXPENSE_CATEGORIES = [
  'fuel',
  'toll',
  'parking',
  'food',
  'lodging',
  'transport',
  'supplies',
  'other',
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export const expenseFormSchema = z.object({
  amount: z
    .number({
      required_error: 'Masukkan jumlah pengeluaran',
      invalid_type_error: 'Jumlah tidak valid',
    })
    .positive('Jumlah harus lebih dari 0'),

  category: z.enum(EXPENSE_CATEGORIES, {
    required_error: 'Pilih kategori pengeluaran',
    invalid_type_error: 'Kategori tidak valid',
  }),

  vendorName: z.string().optional(),

  vendorId: z.string().uuid().optional().nullable(),

  description: z
    .string()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional(),

  expenseDate: z
    .date({
      required_error: 'Pilih tanggal pengeluaran',
      invalid_type_error: 'Tanggal tidak valid',
    })
    .max(new Date(), 'Tanggal tidak boleh di masa depan'),

  receiptId: z.string().uuid().optional().nullable(),
})

export type ExpenseFormData = z.infer<typeof expenseFormSchema>

export const expenseFormDefaults: Partial<ExpenseFormData> = {
  amount: 0,
  category: undefined,
  vendorName: '',
  vendorId: null,
  description: '',
  expenseDate: new Date(),
  receiptId: null,
}
