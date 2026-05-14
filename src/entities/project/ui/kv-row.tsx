import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

interface KvRowProps {
  label: ReactNode
  value: ReactNode
  valueClassName?: string
}

export function KvRow({ label, value, valueClassName }: KvRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('text-right font-medium text-[#1B1A17]', valueClassName)}>
        {value}
      </span>
    </div>
  )
}
