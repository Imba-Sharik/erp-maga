import { isUnassignProjectManagerId } from './unassign-project-manager'

export function buildChangeManagerRequest(managerId: string) {
  if (isUnassignProjectManagerId(managerId)) {
    return { mag_manager_id: null }
  }

  const mag_manager_id = Number(managerId)
  if (!Number.isFinite(mag_manager_id)) {
    throw new Error('Invalid manager id')
  }
  return { mag_manager_id }
}
