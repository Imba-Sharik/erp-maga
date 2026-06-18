import type { Project } from '@/entities/project'

export interface ClaimingManager {
  /** Полное имя менеджера для подписи карточки («Менеджер MAG: …»). */
  fullName: string
}

/**
 * Оптимистичное состояние проекта сразу после claim: ведущим становится текущий
 * пользователь, кнопка «Взять» исчезает, режим просмотра снимается. Точные значения
 * подтвердит рефетч после успеха.
 */
export function patchClaimedProject(project: Project, manager: ClaimingManager): Project {
  return {
    ...project,
    manager: manager.fullName,
    canClaim: false,
    canEdit: true,
    isReadOnly: false,
  }
}
