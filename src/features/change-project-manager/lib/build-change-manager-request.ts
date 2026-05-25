export function buildChangeManagerRequest(managerId: string) {
  const mag_manager_id = Number(managerId)
  if (!Number.isFinite(mag_manager_id)) {
    throw new Error('Invalid manager id')
  }
  return { mag_manager_id }
}
