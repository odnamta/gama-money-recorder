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

// Base schema without refinement (for backward compatibility)
const expenseFormBaseSchema = z.object({
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

  // Job linking fields
  jobOrderId: z.string().uuid().nullable().optional(),
  isOverhead: z.boolean().default(false).optional(),

  // GPS coordinate fields
  gpsLatitude: z.number().nullable().optional(),
  gpsLongitude: z.number().nullable().optional(),
  gpsAccuracy: z.number().nullable().optional(),

  // Location explanation (required when far from job location)
  locationExplanation: z.string().optional(),
})

// Schema with job linking validation refinement
export const expenseFormSchema = expenseFormBaseSchema.refine(
  (data) => {
    // Only validate if job linking fields are being used
    // (for backward compatibility with existing code)
    const hasJobLinkingFields =
      data.jobOrderId !== undefined || data.isOverhead !== undefined

    if (!hasJobLinkingFields) {
      return true
    }

    // Either jobOrderId must be set OR isOverhead must be true
    return data.isOverhead === true || (data.jobOrderId !== null && data.jobOrderId !== undefined)
  },
  {
    message: 'Pilih job order atau tandai sebagai overhead',
    path: ['jobOrderId'],
  }
)

export type ExpenseFormData = z.infer<typeof expenseFormSchema>

export const expenseFormDefaults: Partial<ExpenseFormData> = {
  amount: 0,
  category: undefined,
  vendorName: '',
  vendorId: null,
  description: '',
  expenseDate: new Date(),
  receiptId: null,
  jobOrderId: null,
  isOverhead: false,
  gpsLatitude: null,
  gpsLongitude: null,
  gpsAccuracy: null,
  locationExplanation: undefined,
}
