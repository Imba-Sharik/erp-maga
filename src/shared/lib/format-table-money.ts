import { formatMoney } from './money'

export function formatTableMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return formatMoney(value)
}
