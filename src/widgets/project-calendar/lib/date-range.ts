import { eachDayOfInterval, isSameDay, min, max } from 'date-fns'

export function getInclusiveDateRange(a: Date, b: Date): Date[] {
  const start = min([a, b])
  const end = max([a, b])
  return eachDayOfInterval({ start, end })
}

export function mergeDates(base: Date[], toAdd: Date[]): Date[] {
  const result = [...base]
  for (const date of toAdd) {
    if (!result.some((d) => isSameDay(d, date))) {
      result.push(date)
    }
  }
  return result.sort((a, b) => a.getTime() - b.getTime())
}

export function removeDates(base: Date[], toRemove: Date[]): Date[] {
  return base.filter((d) => !toRemove.some((r) => isSameDay(d, r)))
}
