import type { ReactNode } from 'react'

function stopRowNavigation(e: React.MouseEvent | React.PointerEvent) {
  e.stopPropagation()
}

export function GridTableRowActionCell({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-[44px] min-w-0 items-center justify-center self-center px-1"
      onClick={stopRowNavigation}
      onPointerDown={stopRowNavigation}
    >
      {children}
    </div>
  )
}
