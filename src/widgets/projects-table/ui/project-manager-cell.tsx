import { useState } from 'react'
import { Star, UserPlus } from 'lucide-react'

import { MANAGER_HALL_ASSIGNMENT_HINT, type ManagerSelectOption } from '@/entities/manager'
import type { Project } from '@/entities/project'
import {
  getLeadAssistantsErrorMessage,
  resolveLeadAssistantsState,
  setLead,
  toggleAssistant,
  type LeadAssistantsSelection,
} from '@/features/change-project-manager'
import { PenIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { GridTableCell } from '@/shared/ui/grid-table'

import { TABLE_EMPTY } from './table-row-cells'

export interface ProjectManagerCellProps {
  /** Проект — источник исходного выбора (ведущий + вспомогательные) и имени. */
  project: Project
  editable?: boolean
  /** Менеджеры по залам проекта (грузятся для редактируемой строки). */
  directoryOptions: ManagerSelectOption[]
  optionsLoading?: boolean
  optionsError?: boolean
  showHallAssignmentHint?: boolean
  isOpen: boolean
  isPending?: boolean
  errorMessage?: string | null
  onOpenChange: (open: boolean) => void
  /** Применить выбор (ведущий + вспомогательные). */
  onApply: (selection: LeadAssistantsSelection) => void
  onClearError?: () => void
}

function stopRowNavigation(e: React.MouseEvent | React.PointerEvent) {
  e.stopPropagation()
}

function initialSelection(project: Project): LeadAssistantsSelection {
  return {
    leadId: project.leadManagerId ?? null,
    assistantIds: (project.assistantManagers ?? []).map((a) => a.id),
  }
}

/**
 * Инлайн-назначение менеджеров Руководителем в таблицах (ERP-189). У каждого менеджера
 * две кнопки: ★ жёлтая — ведущий (только один), красная — вспомогательный. Активная ★
 * блокирует красную у того же менеджера; ведущий и вспомогательный — взаимоисключающи.
 * Изменения применяются по «Готово». Нельзя оставить только вспомогательных без ведущего.
 */
export function ProjectManagerCell({
  project,
  editable = true,
  directoryOptions,
  optionsLoading = false,
  optionsError = false,
  showHallAssignmentHint = false,
  isOpen,
  isPending = false,
  errorMessage = null,
  onOpenChange,
  onApply,
  onClearError,
}: ProjectManagerCellProps) {
  const displayName = project.manager || TABLE_EMPTY
  const initial = initialSelection(project)
  const [draft, setDraft] = useState<LeadAssistantsSelection>(initial)

  // Сброс черновика при открытии (adjust state during render).
  const [wasOpen, setWasOpen] = useState(isOpen)
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) setDraft(initialSelection(project))
  }

  const assignableOptions = showHallAssignmentHint
    ? []
    : directoryOptions.filter((o) => !o.id.startsWith('name:'))
  const state = resolveLeadAssistantsState({ assignableOptions, selection: draft, initial })

  const handleStar = (id: string) => {
    onClearError?.()
    setDraft((d) => (d.leadId === id ? setLead(d, null) : setLead(d, id)))
  }
  const handleRed = (id: string) => {
    onClearError?.()
    setDraft((d) => toggleAssistant(d, id))
  }
  const handleApply = () => {
    if (state.canApply) onApply(draft)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) onClearError?.()
    onOpenChange(open)
  }

  return (
    <div className="min-w-0" onClick={stopRowNavigation} onPointerDown={stopRowNavigation}>
      <GridTableCell>
        <span className="flex w-full min-w-0 items-center gap-1.5">
          {editable && (
            <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-disabled-foreground hover:text-foreground-soft data-[state=open]:text-foreground-soft shrink-0"
                  aria-label="Назначить менеджеров"
                  title="Назначить менеджеров"
                  onClick={stopRowNavigation}
                >
                  <PenIcon className="size-3 shrink-0 [&_path]:fill-current" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="max-h-72 max-w-[18rem] min-w-64 p-0"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <div className="max-h-52 overflow-y-auto p-1">
                  {optionsLoading ? (
                    <p className="text-muted-foreground px-2 py-1.5 text-sm">Загрузка…</p>
                  ) : optionsError ? (
                    <p className="text-destructive px-2 py-1.5 text-sm">
                      Не удалось загрузить менеджеров
                    </p>
                  ) : showHallAssignmentHint ? (
                    <p className="text-muted-foreground max-w-60 px-2 py-1.5 text-sm whitespace-normal">
                      {MANAGER_HALL_ASSIGNMENT_HINT}
                    </p>
                  ) : assignableOptions.length === 0 ? (
                    <p className="text-muted-foreground px-2 py-1.5 text-sm">Нет данных</p>
                  ) : (
                    assignableOptions.map((option) => {
                      const isLead = draft.leadId === option.id
                      const isAssistant = draft.assistantIds.includes(option.id)
                      return (
                        <div
                          key={option.id}
                          className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
                        >
                          <button
                            type="button"
                            disabled={isPending}
                            aria-label="Сделать ведущим"
                            title="Ведущий менеджер"
                            aria-pressed={isLead}
                            onClick={() => handleStar(option.id)}
                            className="shrink-0 disabled:opacity-40"
                          >
                            <Star
                              className={cn(
                                'size-4',
                                isLead
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-disabled-foreground',
                              )}
                            />
                          </button>
                          <button
                            type="button"
                            disabled={isPending || isLead}
                            aria-label="Сделать вспомогательным"
                            title="Вспомогательный менеджер"
                            aria-pressed={isAssistant}
                            onClick={() => handleRed(option.id)}
                            className="shrink-0 disabled:opacity-40"
                          >
                            <UserPlus
                              className={cn(
                                'size-4',
                                isAssistant ? 'text-red-500' : 'text-disabled-foreground',
                              )}
                            />
                          </button>
                          <span className="min-w-0 truncate" title={option.fullName}>
                            {option.fullName}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
                {!optionsLoading && !optionsError && !showHallAssignmentHint ? (
                  <>
                    <DropdownMenuSeparator />
                    <div className="flex flex-col gap-1.5 p-1.5">
                      {state.errorKey ? (
                        <p className="text-destructive px-0.5 text-sm wrap-break-word whitespace-normal">
                          {getLeadAssistantsErrorMessage(state.errorKey)}
                        </p>
                      ) : null}
                      {errorMessage ? (
                        <p className="text-destructive px-0.5 text-sm wrap-break-word whitespace-normal">
                          {errorMessage}
                        </p>
                      ) : null}
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 w-full rounded-[8px]"
                        disabled={isPending || !state.canApply}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApply()
                        }}
                      >
                        {isPending ? 'Сохранение…' : 'Готово'}
                      </Button>
                    </div>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <span
            className={cn(
              'text-muted-foreground min-w-0 truncate',
              isOpen && 'text-foreground-soft',
            )}
            title={displayName}
          >
            {displayName}
          </span>
        </span>
      </GridTableCell>
    </div>
  )
}
