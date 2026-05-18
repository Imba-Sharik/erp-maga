import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

interface KvRowProps {
  label: ReactNode
  value: ReactNode
  valueClassName?: string
}

const EMPTY = '—'

function isEmptyValue(value: ReactNode): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  return false
}

export function KvRow({ label, value, valueClassName }: KvRowProps) {
  const display = isEmptyValue(value) ? EMPTY : value

  return (
    <div className="flex items-center justify-between gap-3 py-3 text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('text-right font-medium text-[#1B1A17]', valueClassName)}>{display}</span>
    </div>
  )
}
