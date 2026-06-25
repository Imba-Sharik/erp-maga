import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'

import type { StagePresentationConfig } from '@/shared/lib/stage-presentation'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Collapsible, CollapsibleContent } from '@/shared/ui/collapsible'
import { stageBlockBorderClass } from '@/entities/stage-draft'

import { StageStatusHeader } from './stage-status-header'

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
  /** Доп. действия в шапке слева от «Следующий этап» (напр. «Предыдущий этап»). */
  headerActions?: ReactNode
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
  headerActions,
  children,
}: StageBlockShellProps) {
  const showHeaderRow = shell.showStageHeader
  const showAdvance = shell.showAdvanceButton && isCurrent && canShowAdvance

  const headerContent = (
    <StageStatusHeader
      statusLabel={isCurrent ? 'Текущий этап:' : 'Этап пройден:'}
      title={headerTitle}
      titleClassName={headerColorClass}
      collapsible={shell.stageCollapsible}
    />
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
        '@container flex flex-col rounded-[15px] border bg-white p-2.5 @xl:p-5',
        stageBlockBorderClass(hasDraftHighlight),
      )}
    >
      {(showHeaderRow || showAdvance || headerActions) && (
        <div className="flex flex-col items-stretch gap-3 @xl:flex-row @xl:flex-wrap @xl:items-center @xl:justify-between">
          {showHeaderRow ? headerContent : null}
          {headerActions || showAdvance ? (
            <div className="flex flex-wrap items-center justify-end gap-2.5">
              {headerActions}
              {showAdvance ? (
                <Button
                  type="button"
                  onClick={() => onAdvance?.()}
                  className="h-[38px] rounded-[10px] px-4"
                >
                  <span className="text-xs @xl:text-sm">Следующий этап</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              ) : null}
            </div>
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
