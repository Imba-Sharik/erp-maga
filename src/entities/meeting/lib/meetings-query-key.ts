import type { ListMeetingsParams } from '../model/types'

export function meetingsCalendarQueryKey(params: ListMeetingsParams) {
  return ['meetings', 'calendar', params] as const
}
