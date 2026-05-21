import type { ReactNode } from 'react'

export const TABLE_EMPTY = '—'

export function formatGridTableList(values: readonly string[]): string {
  return values.length > 0 ? values.join(', ') : TABLE_EMPTY
}

export function GridTableCell({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return (
    <div
      className={`flex min-h-[44px] min-w-0 items-center px-3 py-2 text-sm ${
        muted ? 'text-[#ACACAC]' : 'text-[#454545]'
      }`}
    >
      {typeof children === 'string' ? (
        <span className="w-full truncate">{children}</span>
      ) : (
        children
      )}
    </div>
  )
}
