import type { ReactNode } from 'react'

function stopRowNavigation(e: React.MouseEvent | React.PointerEvent) {
  e.stopPropagation()
}

export function GridTableRowActionCell({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-[44px] items-center justify-center px-2 py-2"
      onClick={stopRowNavigation}
      onPointerDown={stopRowNavigation}
    >
      {children}
    </div>
  )
}
