import type { VenueHall, VenueLoft } from '@/entities/venue'

export type ManagerAssignmentOption = {
  key: string
  label: string
}

export type ManagerAssignmentOptionGroup = {
  /** Подзаголовок группы (имя лофта). Если не задан — рендерится без заголовка. */
  label?: string
  options: ManagerAssignmentOption[]
}

function sortByLabelRu(a: ManagerAssignmentOption, b: ManagerAssignmentOption): number {
  return a.label.localeCompare(b.label, 'ru')
}

function sortByNameRu(a: VenueLoft, b: VenueLoft): number {
  return a.name.localeCompare(b.name, 'ru')
}

/** Опции лофтов: ключ — id лофта. */
export function buildLoftAssignmentOptions(lofts: readonly VenueLoft[]): ManagerAssignmentOption[] {
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
): ManagerAssignmentOptionGroup[] {
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
