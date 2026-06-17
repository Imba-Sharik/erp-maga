export const UNASSIGN_PROJECT_MANAGER_ID = '__unassign_project_manager__'

export const UNASSIGN_PROJECT_MANAGER_LABEL = 'Снять назначение'

export function isUnassignProjectManagerId(managerId: string): boolean {
  return managerId === UNASSIGN_PROJECT_MANAGER_ID
}
