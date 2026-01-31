export const EXPENSE_CATEGORIES = {
  fuel: {
    label: 'BBM',
    labelFull: 'Bahan Bakar',
    icon: 'Fuel',
    color: 'orange',
  },
  toll: {
    label: 'Tol',
    labelFull: 'Tol',
    icon: 'Route',
    color: 'blue',
  },
  parking: {
    label: 'Parkir',
    labelFull: 'Parkir',
    icon: 'ParkingCircle',
    color: 'purple',
  },
  food: {
    label: 'Makan',
    labelFull: 'Makan & Minum',
    icon: 'UtensilsCrossed',
    color: 'green',
  },
  lodging: {
    label: 'Penginapan',
    labelFull: 'Penginapan',
    icon: 'Bed',
    color: 'indigo',
  },
  transport: {
    label: 'Transport',
    labelFull: 'Transport Lokal',
    icon: 'Car',
    color: 'cyan',
  },
  supplies: {
    label: 'Perlengkapan',
    labelFull: 'Perlengkapan',
    icon: 'Package',
    color: 'amber',
  },
  other: {
    label: 'Lainnya',
    labelFull: 'Lainnya',
    icon: 'MoreHorizontal',
    color: 'gray',
  },
} as const

export type ExpenseCategory = keyof typeof EXPENSE_CATEGORIES

export const EXPENSE_CATEGORY_LIST = Object.entries(EXPENSE_CATEGORIES).map(
  ([key, value]) => ({
    value: key as ExpenseCategory,
    ...value,
  })
)
