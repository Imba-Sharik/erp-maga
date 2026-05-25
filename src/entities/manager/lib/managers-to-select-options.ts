import type { ManagerSelectOption } from '../model/manager-select-option'
import type { Manager } from '../model/types'

export function managersToSelectOptions(managers: readonly Manager[]): ManagerSelectOption[] {
  return managers
    .map((m) => ({ id: m.id, fullName: m.fullName }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'ru'))
}
