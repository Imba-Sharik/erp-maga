import { ArrowRight, ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

import type { StagePresentationConfig } from '@/widgets/project-detail/lib/stage-presentation'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'
import { stageBlockBorderClass } from '@/entities/stage-draft'

export type StageBlockShellConfig = Pick<
  StagePresentationConfig,
  'showStageHeader' | 'stageCollapsible' | 'showAdvanceButton'
>

interface StageBlockShellProps {
  shell: StageBlockShellConfig
  isCurrent?: boolean
  canShowAdvance?: boolean
  headerTitle: string
  headerColorClass?: string
  hasDraftHighlight?: boolean
  onAdvance?: () => void
  children: ReactNode
}

export function StageBlockShell({
  shell,
  isCurrent = false,
  canShowAdvance = false,
  headerTitle,
  headerColorClass = 'text-[#454545]',
  hasDraftHighlight,
  onAdvance,
  children,
}: StageBlockShellProps) {
  const showHeaderRow = shell.showStageHeader
  const showAdvance = shell.showAdvanceButton && isCurrent && canShowAdvance

  const stageLabel = (
    <>
      <span className="font-medium text-[#454545]">
        {isCurrent ? 'Текущий этап:' : 'Этап пройден:'}
      </span>
      <span className={cn('font-semibold', headerColorClass)}>{headerTitle}</span>
    </>
  )

  const headerContent = shell.stageCollapsible ? (
    <CollapsibleTrigger className="group flex items-center gap-1.5 text-sm">
      {stageLabel}
      <ChevronDown className="text-muted-foreground size-3.5 transition-transform group-data-[state=closed]:-rotate-90" />
    </CollapsibleTrigger>
  ) : (
    <div className="flex items-center gap-1.5 text-sm">{stageLabel}</div>
  )

  const body = (
    <>
      {showHeaderRow ? <div className="h-px w-full bg-[#F0F0F0]" /> : null}
      {children}
    </>
  )

  const card = (
    <div
      className={cn(
        'flex flex-col rounded-[15px] border bg-white p-5',
        stageBlockBorderClass(hasDraftHighlight),
      )}
    >
      {(showHeaderRow || showAdvance) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {showHeaderRow ? headerContent : null}
          {showAdvance ? (
            <Button
              type="button"
              onClick={() => onAdvance?.()}
              className="h-[38px] rounded-[10px] px-4 text-sm"
            >
              Следующий этап
              <ArrowRight className="size-3.5" />
            </Button>
          ) : null}
        </div>
      )}
      {shell.stageCollapsible ? (
        // pt-5 (а не gap на карточке) — отступ входит в анимируемую высоту,
        // иначе при сворачивании gap исчезает скачком в момент unmount.
        <CollapsibleContent className="flex flex-col gap-5 pt-5">{body}</CollapsibleContent>
      ) : (
        <div className="flex flex-col gap-5">{body}</div>
      )}
    </div>
  )

  if (shell.stageCollapsible) {
    return (
      <Collapsible defaultOpen className="w-full">
        {card}
      </Collapsible>
    )
  }

  return <div className="w-full">{card}</div>
}
