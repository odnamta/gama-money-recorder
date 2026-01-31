'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  expenseFormSchema,
  expenseFormDefaults,
  type ExpenseFormData,
} from '@/lib/schemas/expense'

export function useExpenseForm() {
  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: expenseFormDefaults,
    mode: 'onBlur',
  })

  const reset = () => {
    form.reset({
      ...expenseFormDefaults,
      expenseDate: new Date(), // Always reset to today
    })
  }

  return {
    ...form,
    resetForm: reset,
  }
}

export type { ExpenseFormData }
