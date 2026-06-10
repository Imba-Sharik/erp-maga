import type { VenueHall } from '../model/types'

/**
 * Логика двунаправленной синхронизации «лофт ⇄ залы».
 *
 * Источник правды — набор выбранных id залов. Лофт — производная сущность:
 * лофт считается выбранным, если выбран хотя бы один его зал. Переключение
 * лофта раскрывается в добавление/снятие всех его залов.
 */

/** Внутренние id залов, относящихся к лофту `loftId`. */
export function getHallIdsForLoft(halls: readonly VenueHall[], loftId: number): number[] {
  return halls.filter((hall) => hall.loft?.id === loftId).map((hall) => hall.id)
}

/** Выбранные лофты, выведенные из выбранных залов (лофт выбран, если выбран ≥1 его зал). */
export function deriveSelectedLoftIds(
  halls: readonly VenueHall[],
  selectedHallIds: Iterable<number>,
): number[] {
  const selected = new Set(selectedHallIds)
  const loftIds = new Set<number>()
  for (const hall of halls) {
    const loftId = hall.loft?.id
    if (loftId != null && selected.has(hall.id)) loftIds.add(loftId)
  }
  return [...loftIds]
}

/**
 * Применяет новое состояние выбора лофтов к набору залов.
 * Лофт добавлен → добавляем все его залы; лофт снят → снимаем все его залы.
 * Возвращает новый набор id залов (без дубликатов, порядок не гарантируется).
 */
export function applyLoftSelection(
  halls: readonly VenueHall[],
  selectedHallIds: Iterable<number>,
  nextLoftIds: Iterable<number>,
): number[] {
  const result = new Set(selectedHallIds)
  const currentLoftIds = new Set(deriveSelectedLoftIds(halls, result))
  const nextLofts = new Set(nextLoftIds)

  for (const loftId of nextLofts) {
    if (currentLoftIds.has(loftId)) continue
    for (const hallId of getHallIdsForLoft(halls, loftId)) result.add(hallId)
  }

  for (const loftId of currentLoftIds) {
    if (nextLofts.has(loftId)) continue
    for (const hallId of getHallIdsForLoft(halls, loftId)) result.delete(hallId)
  }

  return [...result]
}

/**
 * Синхронизирует пару «залы + производные лофты» после изменения набора залов.
 * Используется в формах (create-project) и при отображении выбора.
 */
export function syncLoftHallSelection(
  halls: readonly VenueHall[],
  hallIds: Iterable<number>,
): { hallIds: number[]; loftIds: number[] } {
  const normalizedHallIds = [...new Set(hallIds)]
  return {
    hallIds: normalizedHallIds,
    loftIds: deriveSelectedLoftIds(halls, normalizedHallIds),
  }
}
