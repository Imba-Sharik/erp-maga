import { PenIcon } from '@/shared/assets'
import { useCurrentUser } from '@/entities/current-user'
import { useManagersDirectory } from '@/entities/manager'
import { isProjectLeadManager, type Project } from '@/entities/project'
import { DropdownMenuItem } from '@/shared/ui/dropdown-menu'

import {
  buildAssistantCandidates,
  buildAssistantMenuItems,
  canShowAddAssistant,
  type AssistantMenuItem,
} from '../lib/assistant-menu'

export interface AssistantMenuItemsProps {
  project: Project
  /** Открыть модалку добавления вспомогательного. */
  onAdd: () => void
  /** Открыть модалку замены/снятия конкретного вспомогательного. */
  onEdit: (assistant: AssistantMenuItem) => void
}

/**
 * Пункты контекстного меню карточки для ВЕДУЩЕГО менеджера (ERP-189): уже назначенные
 * вспомогательные (клик/карандаш → заменить/снять) и «+ Вспомогательный» (если есть
 * кого добавить). Для не-ведущего ничего не рендерит.
 */
export function AssistantMenuItems({ project, onAdd, onEdit }: AssistantMenuItemsProps) {
  const currentUser = useCurrentUser()
  const isLead = isProjectLeadManager(project, currentUser.id)
  const projectIdNumber = Number(project.id)
  const hasProjectId = Number.isFinite(projectIdNumber)

  const { selectOptions: directoryOptions } = useManagersDirectory(
    hasProjectId ? { projectId: projectIdNumber } : undefined,
    { enabled: isLead && hasProjectId },
  )

  if (!isLead) return null

  const assigned = buildAssistantMenuItems(project.assistantManagers ?? [])
  const candidates = buildAssistantCandidates({
    directoryOptions,
    leadManagerId: project.leadManagerId,
    assignedAssistants: project.assistantManagers ?? [],
  })
  const showAdd = canShowAddAssistant({ isLeadManager: isLead, assignableCandidates: candidates })

  if (assigned.length === 0 && !showAdd) return null

  return (
    <>
      {assigned.map((assistant) => (
        <DropdownMenuItem
          key={assistant.id}
          className="justify-between gap-2"
          onSelect={() => onEdit(assistant)}
        >
          <span className="min-w-0 truncate">{assistant.fullName}</span>
          <PenIcon className="size-3 shrink-0 text-[#ACACAC] [&_path]:fill-current" />
        </DropdownMenuItem>
      ))}
      {showAdd ? <DropdownMenuItem onSelect={onAdd}>+ Вспомогательный</DropdownMenuItem> : null}
    </>
  )
}
