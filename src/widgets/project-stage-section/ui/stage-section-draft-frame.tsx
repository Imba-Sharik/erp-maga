import type { ReactNode } from 'react'

interface StageSectionDraftFrameProps {
  hasDraftHighlight?: boolean
  children: ReactNode
}

export function StageSectionDraftFrame({
  hasDraftHighlight,
  children,
}: StageSectionDraftFrameProps) {
  if (!hasDraftHighlight) return children

  return (
    <div className="flex w-full flex-col gap-1">
      {children}
      <p className="text-xs text-[#AA8540]">Продолжите редактирование</p>
    </div>
  )
}
