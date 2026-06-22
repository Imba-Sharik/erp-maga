import { formatMoney } from '@/entities/project-article'

export function formatTableMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return formatMoney(value)
}
