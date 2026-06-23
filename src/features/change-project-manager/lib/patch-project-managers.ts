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
 * Оптимистичное состояние проекта после назначения менеджеров (ERP-189). Бэк пока не
 * хранит вспомогательных, поэтому патчим локальный кэш для отображения в рамках сессии.
 * `canEdit` НЕ понижаем (директор/прочие сохраняют доступ) — только повышаем, если
 * текущий пользователь стал ведущим или вспомогательным. Не мутирует вход.
 */
export function patchProjectManagers(project: Project, next: ProjectManagersPatch): Project {
  const isLead = next.leadId != null && next.leadId === next.currentUserId
  const isAssistant = next.assistants.some((a) => a.id === next.currentUserId)
  return {
    ...project,
    manager: next.leadName,
    leadManagerId: next.leadId,
    assistantManagers: next.assistants,
    isLeadManager: isLead,
    isAssistantManager: isAssistant,
    canEdit: project.canEdit || isLead || isAssistant,
  }
}
