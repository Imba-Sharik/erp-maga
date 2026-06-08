import { format } from 'date-fns'

export function toDayKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function groupByDay<T>(items: T[], getDateKey: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const key = getDateKey(item)
    const list = map.get(key)
    if (list) list.push(item)
    else map.set(key, [item])
  }
  return map
}
