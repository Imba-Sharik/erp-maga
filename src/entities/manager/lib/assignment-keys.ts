import type { ManagerAssignment } from '../model/types'

export type ManagerAssignmentMode = 'halls' | 'lofts'

export function hallOnlyAssignmentKey(hallId: number): string {
  return `hall:${hallId}`
}

export function loftAssignmentKey(hallId: number, loftId: number): string {
  return `loft:${hallId}:${loftId}`
}

export function parseAssignmentKey(key: string): { hallId: number; loftId: number | null } {
  if (key.startsWith('hall:')) {
    return { hallId: Number(key.slice(5)), loftId: null }
  }
  if (key.startsWith('loft:')) {
    const parts = key.split(':')
    return { hallId: Number(parts[1]), loftId: Number(parts[2]) }
  }
  throw new Error(`Invalid assignment key: ${key}`)
}

export function assignmentToKey(
  assignment: ManagerAssignment,
  mode: ManagerAssignmentMode,
): string | null {
  if (mode === 'halls') {
    if (assignment.loftId !== null) return null
    return hallOnlyAssignmentKey(assignment.hallId)
  }
  if (assignment.loftId === null) return null
  return loftAssignmentKey(assignment.hallId, assignment.loftId)
}

export function getSelectedAssignmentKeys(
  assignments: readonly ManagerAssignment[],
  mode: ManagerAssignmentMode,
): Set<string> {
  const keys = new Set<string>()
  for (const assignment of assignments) {
    const key = assignmentToKey(assignment, mode)
    if (key) keys.add(key)
  }
  return keys
}

export function findAssignmentByKey(
  assignments: readonly ManagerAssignment[],
  key: string,
): ManagerAssignment | undefined {
  const parsed = parseAssignmentKey(key)
  return assignments.find((a) => a.hallId === parsed.hallId && a.loftId === parsed.loftId)
}
