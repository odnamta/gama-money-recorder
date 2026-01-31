'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/format-currency';

interface ReceiptWarningProps {
  amount: number;
  hasReceipt: boolean;
  threshold?: number;
  className?: string;
}

const DEFAULT_THRESHOLD = 500000; // Rp 500.000

export function ReceiptWarning({
  amount,
  hasReceipt,
  threshold = DEFAULT_THRESHOLD,
  className,
}: ReceiptWarningProps) {
  const requiresReceipt = amount > threshold;
  const showWarning = requiresReceipt && !hasReceipt;

  if (!showWarning) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg',
        'bg-amber-50 border border-amber-200',
        className
      )}
    >
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-800">
          Struk Diperlukan
        </p>
        <p className="text-sm text-amber-700 mt-0.5">
          Pengeluaran di atas {formatCurrency(threshold)} wajib melampirkan foto struk.
        </p>
      </div>
    </div>
  );
}
