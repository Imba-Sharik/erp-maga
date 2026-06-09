import {
  meetingsCalendarRetrieveQueryKey,
  meetingsCalendarRetrieveQueryOptions,
} from '@/shared/api/generated/hooks/meetingsController/useMeetingsCalendarRetrieve'
import type { MeetingsCalendarRetrieveQueryParams } from '@/shared/api/generated/types/meetingsController/MeetingsCalendarRetrieve'

import type { ListMeetingsParams } from '../model/types'

export { meetingsCalendarRetrieveQueryKey as meetingsCalendarQueryKey }

export function listMeetingsParamsToApi(
  params: ListMeetingsParams,
): MeetingsCalendarRetrieveQueryParams {
  return {
    date_after: params.dateFrom,
    date_before: params.dateTo,
    ...(params.managerId != null ? { manager: params.managerId } : {}),
  }
}

export function meetingsCalendarQueryOptions(params: ListMeetingsParams) {
  return meetingsCalendarRetrieveQueryOptions(listMeetingsParamsToApi(params))
}
