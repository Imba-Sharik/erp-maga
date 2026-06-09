import { format } from 'date-fns'

/** Считает элементы в Map по дням только за календарный месяц `month`. */
export function countItemsInMonth<T>(itemsByDay: Map<string, T[]>, month: Date): number {
  const prefix = `${format(month, 'yyyy-MM')}-`
  let total = 0
  for (const [key, items] of itemsByDay) {
    if (key.startsWith(prefix)) total += items.length
  }
  return total
}
