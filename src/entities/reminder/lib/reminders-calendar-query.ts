import {
  remindersCalendarRetrieveQueryKey,
  remindersCalendarRetrieveQueryOptions,
} from '@/shared/api/generated/hooks/remindersController/useRemindersCalendarRetrieve'
import type { RemindersCalendarRetrieveQueryParams } from '@/shared/api/generated/types/remindersController/RemindersCalendarRetrieve'

import type { ListRemindersParams } from '../model/types'

export { remindersCalendarRetrieveQueryKey as remindersCalendarQueryKey }

export function listRemindersParamsToApi(
  params: ListRemindersParams,
): RemindersCalendarRetrieveQueryParams {
  return {
    date_after: params.dateFrom,
    date_before: params.dateTo,
  }
}

export function remindersCalendarQueryOptions(params: ListRemindersParams) {
  return remindersCalendarRetrieveQueryOptions(listRemindersParamsToApi(params))
}
