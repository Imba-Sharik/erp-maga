import { useMemo, useState } from 'react'

import {
  MANAGER_HALL_ASSIGNMENT_HINT,
  useManagersDirectory,
  type ManagerSelectOption,
} from '@/entities/manager'
import type { Project, ProjectAssistantManager } from '@/entities/project'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { MultiSelect, type MultiSelectOption } from '@/shared/ui/multi-select'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

import {
  getLeadAssistantsErrorMessage,
  resolveLeadAssistantsState,
  setLead,
  type LeadAssistantsSelection,
} from '../lib/lead-assistants-form'
import {
  UNASSIGN_PROJECT_MANAGER_ID,
  UNASSIGN_PROJECT_MANAGER_LABEL,
} from '../lib/unassign-project-manager'
import { useChangeProjectManagers } from '../model/use-change-project-managers'

const TRIGGER_CLASS =
  'h-10 w-full rounded-[10px] border-border-strong bg-white data-placeholder:text-disabled-foreground'

export interface ChangeProjectManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Проект, чьих менеджеров меняем (null — диалог закрыт). */
  project: Project | null
}

/**
 * Назначение менеджеров руководителем (ERP-189): два селекта — «Ведущий» (один) и
 * «Вспомогательные» (мультиселект). Менеджер, выбранный в одном селекте, в другом
 * заблокирован. Применить нельзя, если вспомогательные есть, а ведущий не выбран.
 */
export function ChangeProjectManagerDialog({
  open,
  onOpenChange,
  project,
}: ChangeProjectManagerDialogProps) {
  const projectIdNumber = useMemo(() => {
    if (!project) return undefined
    const id = Number(project.id)
    return Number.isFinite(id) ? id : undefined
  }, [project])

  const {
    selectOptions: directoryOptions,
    isOptionsLoading: isManagersLoading,
    isError: isManagersError,
    showHallAssignmentHint,
  } = useManagersDirectory(
    projectIdNumber !== undefined ? { projectId: projectIdNumber } : undefined,
    { enabled: open && projectIdNumber !== undefined },
  )

  const assignableOptions = useMemo<ManagerSelectOption[]>(
    () => (showHallAssignmentHint ? [] : directoryOptions.filter((o) => !o.id.startsWith('name:'))),
    [directoryOptions, showHallAssignmentHint],
  )

  const initial = useMemo<LeadAssistantsSelection>(
    () => ({
      leadId: project?.leadManagerId ?? null,
      assistantIds: (project?.assistantManagers ?? []).map((a) => a.id),
    }),
    [project],
  )

  const [selection, setSelection] = useState<LeadAssistantsSelection>(initial)

  // Сброс выбора к исходному при открытии/смене проекта (adjust state during render,
  // см. https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const resetKey = `${open}|${project?.id ?? ''}`
  const [appliedResetKey, setAppliedResetKey] = useState(resetKey)
  if (resetKey !== appliedResetKey) {
    setAppliedResetKey(resetKey)
    setSelection(initial)
  }

  const { submit, isPending, isError, errorMessage, reset } = useChangeProjectManagers({
    onSuccess: () => onOpenChange(false),
  })

  const state = resolveLeadAssistantsState({ assignableOptions, selection, initial })

  const optionName = (id: string | null): string =>
    id ? (assignableOptions.find((o) => o.id === id)?.fullName ?? '') : ''

  const selectsDisabled = isManagersLoading || isManagersError || showHallAssignmentHint

  const assistantOptions: MultiSelectOption[] = state.assistantOptions.map((o) => ({
    value: o.id,
    label: o.fullName,
    disabled: o.disabled,
  }))

  const handleClose = (next: boolean) => {
    onOpenChange(next)
    if (!next) reset()
  }

  const handleApply = () => {
    if (!project || !state.canApply) return
    const assistants: ProjectAssistantManager[] = selection.assistantIds.map((id) => ({
      id,
      fullName: optionName(id),
    }))
    submit({
      project,
      leadId: selection.leadId,
      leadName: optionName(selection.leadId),
      assistants,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">Сменить менеджеров</DialogTitle>
          {project?.title ? <DialogDescription>Проект: {project.title}</DialogDescription> : null}
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-foreground text-sm font-medium">Ведущий менеджер</span>
            <Select
              value={selection.leadId ?? ''}
              onValueChange={(value) =>
                setSelection((s) =>
                  setLead(s, value === UNASSIGN_PROJECT_MANAGER_ID ? null : value),
                )
              }
              disabled={selectsDisabled}
            >
              <SelectTrigger className={TRIGGER_CLASS}>
                <SelectValue placeholder="Выберите ведущего" />
              </SelectTrigger>
              <SelectContent>
                {selection.leadId ? (
                  <SelectItem value={UNASSIGN_PROJECT_MANAGER_ID}>
                    {UNASSIGN_PROJECT_MANAGER_LABEL}
                  </SelectItem>
                ) : null}
                {state.leadOptions.map((o) => (
                  <SelectItem key={o.id} value={o.id} disabled={o.disabled}>
                    {o.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-foreground text-sm font-medium">Вспомогательные менеджеры</span>
            <MultiSelect
              values={selection.assistantIds}
              onChange={(values) => setSelection((s) => ({ ...s, assistantIds: values }))}
              options={assistantOptions}
              placeholder="Выберите вспомогательных"
              triggerClassName={TRIGGER_CLASS}
              disabled={selectsDisabled}
            />
          </div>

          {state.errorKey ? (
            <p className="text-destructive text-sm">
              {getLeadAssistantsErrorMessage(state.errorKey)}
            </p>
          ) : null}
          {isError && errorMessage ? (
            <p className="text-destructive text-sm">{errorMessage}</p>
          ) : null}
          {isManagersError ? (
            <p className="text-destructive text-sm">Не удалось загрузить список менеджеров</p>
          ) : showHallAssignmentHint ? (
            <p className="text-muted-foreground text-sm">{MANAGER_HALL_ASSIGNMENT_HINT}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-[10px]"
              onClick={() => handleClose(false)}
              disabled={isPending}
            >
              Отмена
            </Button>
            <Button
              type="button"
              className="rounded-[10px] bg-black text-white hover:bg-black/90"
              onClick={handleApply}
              disabled={!state.canApply || isPending}
            >
              {isPending ? 'Сохранение…' : 'Применить'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
