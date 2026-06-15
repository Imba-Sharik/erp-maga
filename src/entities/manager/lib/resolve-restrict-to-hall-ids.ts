import type { Manager } from '../model/types'

import { getSelectedHallIds } from './assignment-keys'

export interface ResolveRestrictToHallIdsOptions {
  /** false — фильтр менеджера недоступен (роль manager и т.п.). */
  enabled?: boolean
}

/**
 * Id залов для сужения каталога площадок при выбранном менеджере.
 * undefined — менеджер не выбран или фильтр выключен.
 * [] — менеджер выбран, но без назначений.
 */
export function resolveRestrictToHallIds(
  managerId: string | null | undefined,
  managers: readonly Manager[],
  { enabled = true }: ResolveRestrictToHallIdsOptions = {},
): readonly number[] | undefined {
  if (!enabled || !managerId) return undefined

  const manager = managers.find((m) => m.id === managerId)
  return manager ? getSelectedHallIds(manager.assignments) : []
}
