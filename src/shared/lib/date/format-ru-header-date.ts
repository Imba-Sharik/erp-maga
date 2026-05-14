import { RU_MONTHS_GENITIVE, RU_WEEKDAYS_SHORT } from './constants-ru'

export function formatRuHeaderDate(date: Date): string {
  const wd = RU_WEEKDAYS_SHORT[date.getDay()]
  const day = date.getDate()
  const month = RU_MONTHS_GENITIVE[date.getMonth()]
  const year = date.getFullYear()
  return `${wd}, ${day} ${month} ${year}`
}
