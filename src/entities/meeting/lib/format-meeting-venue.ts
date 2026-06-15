import type { MeetingHall } from '../model/types'

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

/** Уникальные подписи лофтов и залов встречи для отображения в UI. */
export function formatMeetingVenueLabels(halls: readonly MeetingHall[]): {
  lofts: string
  halls: string
} {
  return {
    lofts: uniqueNonEmpty(halls.map((hall) => hall.loftName)).join(', '),
    halls: uniqueNonEmpty(halls.map((hall) => hall.hallName)).join(', '),
  }
}

/** Строка «лофт · зал» для карточки встречи. */
export function formatMeetingVenueLine(halls: readonly MeetingHall[]): string {
  const { lofts, halls: hallLabels } = formatMeetingVenueLabels(halls)
  return [lofts, hallLabels].filter(Boolean).join(' · ')
}

/** Сохраняет известные подписи залов при optimistic-обновлении по id. */
export function meetingHallsForHallIds(
  previous: readonly MeetingHall[],
  hallIds: readonly number[],
): MeetingHall[] {
  return hallIds.map((hallId) => {
    const existing = previous.find((hall) => hall.hallId === hallId)
    return (
      existing ?? {
        hallId,
        hallName: '',
        loftId: null,
        loftName: '',
      }
    )
  })
}
