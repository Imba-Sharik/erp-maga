import { assignmentToKey, type ManagerAssignmentMode } from './assignment-keys'
import type { Manager } from '../model/types'

export type AssignmentOccupant = {
  managerId: string
  fullName: string
}

export function buildAssignmentOccupancy(
  managers: readonly Manager[],
  excludeManagerId: string,
  mode: ManagerAssignmentMode,
): ReadonlyMap<string, AssignmentOccupant> {
  const map = new Map<string, AssignmentOccupant>()

  for (const manager of managers) {
    if (manager.id === excludeManagerId) continue

    for (const assignment of manager.assignments) {
      const key = assignmentToKey(assignment, mode)
      if (key && !map.has(key)) {
        map.set(key, { managerId: manager.id, fullName: manager.fullName })
      }
    }
  }

  return map
}
