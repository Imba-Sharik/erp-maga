export type { Manager, ManagerAssignment } from './model/types'
export type { ManagerSelectOption } from './model/manager-select-option'
export { resolveManagerFilterName } from './model/manager-select-option'
export type { ManagerAssignmentMode } from './lib/assignment-keys'
export {
  findAssignmentByKey,
  getSelectedAssignmentKeys,
  hallOnlyAssignmentKey,
  loftAssignmentKey,
  parseAssignmentKey,
} from './lib/assignment-keys'
export { buildAssignmentOccupancy, type AssignmentOccupant } from './lib/build-assignment-occupancy'
export { invalidateManagersDirectory } from './lib/invalidate-managers-directory'
export { useManagersDirectory } from './model/use-managers-directory'
export { buildManagerSelectOptions } from './lib/manager-select-options'
