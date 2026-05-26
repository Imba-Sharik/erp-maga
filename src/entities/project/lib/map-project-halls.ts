import type { ProjectHallItem } from '@/shared/api/generated/types/ProjectHallItem'

export type ProjectVenueFields = {
  loft: string
  hall: string
  /** Компактная подпись при нескольких залах (календарь, карточки). */
  hallLoft?: string
}

function uniqueNonEmpty(values: readonly string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const value of values) {
    const trimmed = value.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    result.push(trimmed)
  }
  return result
}

function formatHallLoftLine(item: ProjectHallItem): string {
  const loft = item.loft_name.trim()
  const hall = item.hall_name.trim()
  if (loft && hall) return `${loft} — ${hall}`
  return hall || loft
}

/** Проекция `halls[]` API в поля UI `loft` / `hall` / `hallLoft`. */
export function projectVenueFieldsFromHalls(halls: readonly ProjectHallItem[]): ProjectVenueFields {
  if (halls.length === 0) {
    return { loft: '', hall: '' }
  }

  const loft = uniqueNonEmpty(halls.map((h) => h.loft_name)).join(', ')
  const hall = halls.map((h) => h.hall_name).join(', ')

  if (halls.length === 1) {
    return { loft, hall }
  }

  return {
    loft,
    hall,
    hallLoft: halls.map(formatHallLoftLine).join(' · '),
  }
}

/** Минимальный `halls[]` для patch кэша, когда известны только подписи UI. */
export function projectHallItemsFromVenue(loft: string, hall: string): ProjectHallItem[] {
  if (!loft.trim() && !hall.trim()) return []
  return [
    {
      hall_id: 0,
      hall_name: hall,
      loft_id: null,
      loft_name: loft,
    },
  ]
}
