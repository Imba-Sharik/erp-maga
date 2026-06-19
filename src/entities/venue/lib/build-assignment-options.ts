import { deriveSelectedLoftIds } from './loft-hall-selection'
import type { VenueHall, VenueLoft } from '../model/types'

export type VenueAssignmentOption = {
  key: string
  label: string
}

export type VenueAssignmentOptionGroup = {
  /** Подзаголовок группы (имя лофта). Если не задан — рендерится без заголовка. */
  label?: string
  options: VenueAssignmentOption[]
}

function sortByLabelRu(a: VenueAssignmentOption, b: VenueAssignmentOption): number {
  return a.label.localeCompare(b.label, 'ru')
}

function sortByNameRu(a: VenueLoft, b: VenueLoft): number {
  return a.name.localeCompare(b.name, 'ru')
}

/** Опции лофтов: ключ — id лофта. */
export function buildLoftAssignmentOptions(lofts: readonly VenueLoft[]): VenueAssignmentOption[] {
  return lofts.map((loft) => ({ key: String(loft.id), label: loft.name })).sort(sortByLabelRu)
}

/**
 * Группы залов для выбранных лофтов: один блок на лофт (подзаголовок — имя лофта),
 * внутри — залы этого лофта. Показываем только залы выбранных лофтов.
 */
export function buildHallAssignmentGroups(
  halls: readonly VenueHall[],
  lofts: readonly VenueLoft[],
  selectedLoftIds: readonly number[],
): VenueAssignmentOptionGroup[] {
  const selected = new Set(selectedLoftIds)

  return lofts
    .filter((loft) => selected.has(loft.id))
    .sort(sortByNameRu)
    .map((loft) => ({
      label: loft.name,
      options: halls
        .filter((hall) => hall.loft?.id === loft.id)
        .map((hall) => ({ key: String(hall.id), label: hall.name }))
        .sort(sortByLabelRu),
    }))
}

/** Подзаголовок группы для закреплённых залов без выводимого лофта. */
const NO_LOFT_GROUP_LABEL = 'Без лофта'

/**
 * Группы залов для UI: залы выбранных лофтов (лофты выводятся из `selectedHallIds`),
 * плюс группа «Без лофта» для уже закреплённых залов, которые не попали ни в один лофт
 * (зал с `loft = null`, лофт вне каталога или зал-сирота, отсутствующий в каталоге).
 * Без этой группы такой зал не получил бы чекбокса и его нельзя было бы снять.
 *
 * Общий шаг для страницы «Менеджеры» и формы создания проекта. `fallbackHallNames`
 * (id зала → имя) нужен, чтобы подписать залы, которых нет в каталоге — на странице
 * менеджеров имена берутся из назначений.
 */
export function buildFilteredHallGroups(
  halls: readonly VenueHall[],
  lofts: readonly VenueLoft[],
  selectedHallIds: Iterable<number>,
  fallbackHallNames?: ReadonlyMap<number, string>,
): VenueAssignmentOptionGroup[] {
  const selected = new Set(selectedHallIds)
  const loftIds = deriveSelectedLoftIds(halls, selectedHallIds)
  const groups = buildHallAssignmentGroups(halls, lofts, loftIds)

  const covered = new Set<number>()
  for (const group of groups) {
    for (const option of group.options) covered.add(Number(option.key))
  }

  const hallNameById = new Map(halls.map((hall) => [hall.id, hall.name] as const))
  const orphanOptions: VenueAssignmentOption[] = []
  for (const hallId of selected) {
    if (covered.has(hallId)) continue
    const label = hallNameById.get(hallId) ?? fallbackHallNames?.get(hallId) ?? `Зал #${hallId}`
    orphanOptions.push({ key: String(hallId), label })
  }

  if (orphanOptions.length === 0) return groups

  orphanOptions.sort(sortByLabelRu)
  return [...groups, { label: NO_LOFT_GROUP_LABEL, options: orphanOptions }]
}
