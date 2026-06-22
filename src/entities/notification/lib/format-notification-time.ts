const TIME_FORMAT = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })
const DATE_FORMAT = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })
const DAY_MONTH_FORMAT = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** «Сегодня, 09:14» / «Вчера, 18:42» / «29 апр, 18:30». */
export function formatNotificationTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''

  const now = new Date()
  const time = TIME_FORMAT.format(d)

  if (isSameDay(d, now)) return `Сегодня, ${time}`

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (isSameDay(d, yesterday)) return `Вчера, ${time}`

  // Intl для короткого месяца отдаёт «апр.» — точку убираем под стиль макета.
  const date = DATE_FORMAT.format(d).replace('.', '')
  return `${date}, ${time}`
}

/** Только время — «09:14». Для элементов внутри группы, где день уже в заголовке. */
export function formatNotificationClock(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return TIME_FORMAT.format(d)
}

/** Заголовок группы по дню: «Сегодня» / «Вчера» / «22 июня» / «22 июня 2025». */
export function formatNotificationDayHeader(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''

  const now = new Date()
  if (isSameDay(d, now)) return 'Сегодня'

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (isSameDay(d, yesterday)) return 'Вчера'

  const base = DAY_MONTH_FORMAT.format(d)
  return d.getFullYear() === now.getFullYear() ? base : `${base} ${d.getFullYear()}`
}
