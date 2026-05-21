import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

/** Базовые стили строки таблицы (hover без «кликабельного» курсора). */
export const GRID_TABLE_ROW_CLASS = cn(
  'grid w-full items-center text-left transition-colors hover:bg-[#FAF9F6]',
)

/** Строка с переходом в деталку (проекты и т.п.). */
export const GRID_TABLE_ROW_NAV_CLASS = cn(
  GRID_TABLE_ROW_CLASS,
  'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
)

interface GridTableRowProps extends ComponentPropsWithoutRef<'div'> {
  gridTemplate: string
  children: ReactNode
  /** Кликабельная строка с focus-ring (как в таблице проектов). */
  navigable?: boolean
}

export function GridTableRow({
  gridTemplate,
  children,
  navigable = false,
  className,
  style,
  ...props
}: GridTableRowProps) {
  return (
    <div
      className={cn(navigable ? GRID_TABLE_ROW_NAV_CLASS : GRID_TABLE_ROW_CLASS, className)}
      style={{ gridTemplateColumns: gridTemplate, ...style }}
      {...props}
    >
      {children}
    </div>
  )
}
