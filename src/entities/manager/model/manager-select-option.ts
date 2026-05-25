export interface ManagerSelectOption {
  id: string
  fullName: string
}

export function resolveManagerFilterName(
  managerId: string | null,
  options: readonly ManagerSelectOption[],
): string | null {
  if (!managerId) return null
  return options.find((o) => o.id === managerId)?.fullName ?? null
}
