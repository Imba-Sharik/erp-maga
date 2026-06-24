import { useMemo, useState } from 'react'

import { MANAGER_HALL_ASSIGNMENT_HINT, useManagersDirectory } from '@/entities/manager'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

import { buildAssistantCandidates } from '../lib/assistant-menu'
import { applyAssistantSelection, type AssistantDialogMode } from '../lib/assistant-set'

const TRIGGER_CLASS =
  'h-10 w-full rounded-[10px] border-[#B1B1B1] bg-white data-placeholder:text-[#BCBCBC]'

/** Спец-значение «Снять вспомогательного» в режиме замены. */
const REMOVE_ASSISTANT_ID = '__remove_assistant__'

export interface AssistantManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  mode: AssistantDialogMode
  /** Редактируемый вспомогательный (для mode='edit'). */
  editingAssistant?: ProjectAssistantManager | null
  /** Применение нового набора вспомогательных (персистит борд). */
  onApply: (assistants: ProjectAssistantManager[]) => void
  isPending?: boolean
  errorMessage?: string | null
}

/**
 * Модалка ведущего менеджера (ERP-189): добавить вспомогательного (add) или
 * заменить/снять конкретного (edit). Один селект; список менеджеров — по залам проекта.
 */
export function AssistantManagerDialog({
  open,
  onOpenChange,
  project,
  mode,
  editingAssistant,
  onApply,
  isPending = false,
  errorMessage = null,
}: AssistantManagerDialogProps) {
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

  const candidates = useMemo(
    () =>
      project
        ? buildAssistantCandidates({
            directoryOptions,
            leadManagerId: project.leadManagerId,
            assignedAssistants: project.assistantManagers ?? [],
            excludeAssistantId: mode === 'edit' ? editingAssistant?.id : undefined,
          })
        : [],
    [project, directoryOptions, mode, editingAssistant],
  )

  const initialSelectedId = mode === 'edit' ? (editingAssistant?.id ?? '') : ''
  const [selectedId, setSelectedId] = useState(initialSelectedId)

  // Сброс выбора при открытии/смене режима/редактируемого (adjust state during render).
  const resetKey = `${open}|${mode}|${editingAssistant?.id ?? ''}`
  const [appliedResetKey, setAppliedResetKey] = useState(resetKey)
  if (resetKey !== appliedResetKey) {
    setAppliedResetKey(resetKey)
    setSelectedId(initialSelectedId)
  }

  const selectDisabled = isManagersLoading || isManagersError || showHallAssignmentHint

  const canApply =
    mode === 'add'
      ? Boolean(selectedId)
      : selectedId === REMOVE_ASSISTANT_ID ||
        (Boolean(selectedId) && selectedId !== editingAssistant?.id)

  const optionName = (id: string): string =>
    candidates.find((o) => o.id === id)?.fullName ?? editingAssistant?.fullName ?? ''

  const handleClose = (next: boolean) => onOpenChange(next)

  const handleApply = () => {
    if (!project || !canApply) return
    const selected: ProjectAssistantManager | null =
      selectedId === REMOVE_ASSISTANT_ID || !selectedId
        ? null
        : { id: selectedId, fullName: optionName(selectedId) }
    const assistants = applyAssistantSelection({
      current: project.assistantManagers ?? [],
      mode,
      editingId: editingAssistant?.id,
      selected,
    })
    onApply(assistants)
  }

  const title = mode === 'add' ? 'Добавить вспомогательного' : 'Вспомогательный менеджер'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-[#1B1A17]">{title}</DialogTitle>
          {project?.title ? <DialogDescription>Проект: {project.title}</DialogDescription> : null}
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[#1B1A17]">Вспомогательный менеджер</span>
            <Select value={selectedId} onValueChange={setSelectedId} disabled={selectDisabled}>
              <SelectTrigger className={TRIGGER_CLASS}>
                <SelectValue placeholder="Выберите менеджера" />
              </SelectTrigger>
              <SelectContent>
                {mode === 'edit' ? (
                  <SelectItem value={REMOVE_ASSISTANT_ID}>Снять вспомогательного</SelectItem>
                ) : null}
                {candidates.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}
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
              disabled={!canApply || isPending}
            >
              {isPending ? 'Сохранение…' : 'Применить'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
