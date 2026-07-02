const MONEY_FORMAT = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
})

/**
 * Деньги в системе — целые рубли. Единый округлитель, чтобы отображение (`formatMoney`)
 * и редактируемый черновик (`MoneyInput`) округляли одинаково — иначе фокус на поле
 * вскрывает дробь под округлённой «витриной».
 */
export function roundMoney(value: number): number {
  return Math.round(value)
}

export function formatMoney(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '0 ₽'
  return `${MONEY_FORMAT.format(roundMoney(value))} ₽`
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '0%'
  // Один знак после запятой, но без хвостового нуля.
  const rounded = Math.round(value * 10) / 10
  return `${String(rounded).replace('.', ',')}%`
}

/** Парсит "170 000 ₽" / "170000" / "170 000" → число. Возвращает 0 на невалидный ввод. */
export function parseMoney(input: string): number {
  const digits = input.replace(/[^\d]/g, '')
  if (!digits) return 0
  return Number(digits)
}

/** Парсит "10%" / "10" / "10,5" → число. */
export function parsePercent(input: string): number {
  const cleaned = input.replace(/[^\d.,]/g, '').replace(',', '.')
  if (!cleaned) return 0
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}
