const DATE_FORMAT = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const TIME_FORMAT = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/** «25.05.2026 — 13:02». */
export function formatActivityTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${DATE_FORMAT.format(d)} — ${TIME_FORMAT.format(d)}`
}
