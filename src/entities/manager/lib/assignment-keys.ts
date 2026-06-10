import type { ManagerAssignment } from '../model/types'

/** Режим редактирования назначений (UI: какая ячейка строки в фокусе/в ошибке). */
export type ManagerAssignmentMode = 'halls' | 'lofts'

/**
 * Уникальные id залов менеджера — источник правды назначений.
 * Лофт считается производной сущностью и выводится из набора залов.
 */
export function getSelectedHallIds(assignments: readonly ManagerAssignment[]): number[] {
  return [...new Set(assignments.map((assignment) => assignment.hallId))]
}

/**
 * Все назначения конкретного зала. Их может быть несколько из-за исторических
 * дублей матрицы hall+loft, поэтому при снятии зала нужно удалить их все.
 */
export function findAssignmentsByHallId(
  assignments: readonly ManagerAssignment[],
  hallId: number,
): ManagerAssignment[] {
  return assignments.filter((assignment) => assignment.hallId === hallId)
}
