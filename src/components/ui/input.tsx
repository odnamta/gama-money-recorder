import * as React from 'react'

import { cn } from '@/lib/utils/cn'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'placeholder:text-muted-foreground h-10 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-base shadow-sm transition-colors outline-none',
        'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-red-500 aria-invalid:ring-red-500',
        className
      )}
      {...props}
    />
  )
}

export { Input }
