import type { Project } from '../model/types'

/** Минимальный вход деривации — только поля идентичности менеджеров. */
type ProjectManagerIdentity = Pick<Project, 'leadManagerId' | 'assistantManagers'>

/**
 * Текущий пользователь — ВЕДУЩИЙ менеджер проекта (ERP-189). Выводится из факта
 * `leadManagerId === currentUserId`, а не из бэк-флага (бэк его не отдаёт) и НЕ из
 * `canEdit` (он true и у вспомогательного). Управляет цветом бейджа «Ведущий мен.».
 */
export function isProjectLeadManager(
  project: ProjectManagerIdentity,
  currentUserId: string,
): boolean {
  return project.leadManagerId != null && project.leadManagerId === currentUserId
}

/**
 * Текущий пользователь — ВСПОМОГАТЕЛЬНЫЙ менеджер проекта (ERP-189). Идентичность
 * ассистента — user id (`assistantManagers[].id`), сравниваем с текущим пользователем.
 */
export function isProjectAssistantManager(
  project: ProjectManagerIdentity,
  currentUserId: string,
): boolean {
  return (project.assistantManagers ?? []).some((a) => a.id === currentUserId)
}
