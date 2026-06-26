import type { ReactNode } from 'react'

export function GridTableHeaderLabel({ children }: { children: ReactNode }) {
  return <div className="text-foreground-soft min-w-0 truncate px-3 py-3 text-sm">{children}</div>
}

export function GridTableHeaderCell({
  children,
  'aria-hidden': ariaHidden,
}: {
  children?: ReactNode
  'aria-hidden'?: boolean
}) {
  return (
    <div className="min-w-0 px-3 py-2" aria-hidden={ariaHidden}>
      {children}
    </div>
  )
}
