/** Разность наборов вспомогательных менеджеров для серии add/remove-вызовов (ERP-189). */
export interface AssistantManagersDiff {
  /** user id, которых надо добавить (POST). */
  toAdd: number[]
  /** user id, которых надо снять (DELETE). */
  toRemove: number[]
}

/**
 * Считает, кого добавить и кого снять, чтобы из набора `initialIds` получить `nextIds`.
 * Идентичность — user id (строкой, как в `ProjectAssistantManager.id`); парсится в number
 * для путей/тел запросов. Нечисловые/синтетические id (`name:*`) игнорируются — их нельзя
 * назначить как реального менеджера.
 */
export function diffAssistantManagers(
  initialIds: readonly string[],
  nextIds: readonly string[],
): AssistantManagersDiff {
  const initial = toNumberSet(initialIds)
  const next = toNumberSet(nextIds)

  return {
    toAdd: [...next].filter((id) => !initial.has(id)),
    toRemove: [...initial].filter((id) => !next.has(id)),
  }
}

function toNumberSet(ids: readonly string[]): Set<number> {
  const set = new Set<number>()
  for (const raw of ids) {
    const n = Number(raw)
    if (Number.isFinite(n)) set.add(n)
  }
  return set
}
