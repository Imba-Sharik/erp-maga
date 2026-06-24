import type { Project, ProjectAssistantManager } from '@/entities/project'

export interface ProjectManagersPatch {
  /** id нового ведущего (строкой) или null — снять. */
  leadId: string | null
  /** Имя ведущего для подписи бейджа. */
  leadName: string
  assistants: ProjectAssistantManager[]
  /** id текущего пользователя — чтобы вычислить «я ведущий/вспомогательный». */
  currentUserId: string
}

/**
 * Оптимистичное состояние проекта после назначения менеджеров (ERP-189) — мгновенный
 * отклик до рефетча. Роль «я ведущий/вспомогательный» выводится на UI из `leadManagerId`/
 * `assistantManagers`, поэтому здесь отдельные флаги не пишем. `currentUserId` нужен лишь
 * чтобы поднять `canEdit`, если текущий пользователь стал ведущим/вспомогательным
 * (понижать `canEdit` нельзя — директор/прочие сохраняют доступ). Не мутирует вход.
 */
export function patchProjectManagers(project: Project, next: ProjectManagersPatch): Project {
  const isLead = next.leadId != null && next.leadId === next.currentUserId
  const isAssistant = next.assistants.some((a) => a.id === next.currentUserId)
  return {
    ...project,
    manager: next.leadName,
    leadManagerId: next.leadId,
    assistantManagers: next.assistants,
    canEdit: project.canEdit || isLead || isAssistant,
  }
}
