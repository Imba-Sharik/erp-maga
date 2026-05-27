export const VENUE_FILTER_LABELS = {
  city: 'Город',
  hall: 'Зал',
  loft: 'LOFT',
} as const

export type VenueFilterKey = keyof typeof VENUE_FILTER_LABELS

export function venueFilterLongLabel(key: VenueFilterKey): string {
  if (key === 'loft') return 'Выберите LOFT'
  return `Выберите ${VENUE_FILTER_LABELS[key].toLowerCase()}`
}

export function venueFilterPlaceholder(key: VenueFilterKey, compact: boolean): string {
  return compact ? VENUE_FILTER_LABELS[key] : venueFilterLongLabel(key)
}
