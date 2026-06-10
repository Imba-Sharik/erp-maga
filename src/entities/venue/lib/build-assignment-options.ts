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

/**
 * Группы залов для UI: только залы выбранных лофтов (лофты выводятся из `selectedHallIds`).
 * Общий шаг для страницы «Менеджеры» и формы создания проекта.
 */
export function buildFilteredHallGroups(
  halls: readonly VenueHall[],
  lofts: readonly VenueLoft[],
  selectedHallIds: Iterable<number>,
): VenueAssignmentOptionGroup[] {
  const loftIds = deriveSelectedLoftIds(halls, selectedHallIds)
  return buildHallAssignmentGroups(halls, lofts, loftIds)
}
