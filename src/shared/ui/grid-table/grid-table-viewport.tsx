import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

interface GridTableViewportProps {
  children: ReactNode
  className?: string
}

/** Задаёт верхнюю границу max-height для таблицы в flex-колонке страницы. */
export function GridTableViewport({ children, className }: GridTableViewportProps) {
  return <div className={cn('flex min-h-0 flex-1 flex-col', className)}>{children}</div>
}
