import { useQuery } from '@tanstack/react-query'

import { meetingsCalendarQueryKey } from '../lib/meetings-query-key'
import type { ListMeetingsParams } from './types'
import { listMeetings } from './meetings-mock-store'

export function useMeetingsCalendarList(params: ListMeetingsParams) {
  return useQuery({
    queryKey: meetingsCalendarQueryKey(params),
    queryFn: () => listMeetings(params),
  })
}
