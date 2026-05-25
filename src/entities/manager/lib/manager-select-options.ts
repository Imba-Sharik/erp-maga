import type { ManagerSelectOption } from '../model/manager-select-option'

export function buildManagerSelectOptions(
  directoryOptions: readonly ManagerSelectOption[],
  currentManagerName: string,
): ManagerSelectOption[] {
  const byId = new Map<string, ManagerSelectOption>()
  for (const option of directoryOptions) {
    byId.set(option.id, option)
  }

  if (currentManagerName) {
    const existing = [...byId.values()].find((o) => o.fullName === currentManagerName)
    if (!existing) {
      byId.set(`name:${currentManagerName}`, {
        id: `name:${currentManagerName}`,
        fullName: currentManagerName,
      })
    }
  }

  return [...byId.values()].sort((a, b) => a.fullName.localeCompare(b.fullName, 'ru'))
}
