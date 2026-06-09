import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import {
  fromMeeting,
  prependMeetingToCache,
  removeMeetingFromCache,
  toMeetingCreateRequest,
  type ListMeetingsParams,
  type Meeting,
  type MeetingFormValues,
} from '@/entities/meeting'
import { useMeetingsCreate } from '@/shared/api/generated/hooks/meetingsController/useMeetingsCreate'

type CreateMeetingContext = {
  optimisticId: number
}

function parseMeetingDatetime(
  meetingDatetime: string,
  fallbackDate: string,
): Pick<Meeting, 'date' | 'time'> {
  const match = meetingDatetime.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/)
  return {
    date: match?.[1] ?? fallbackDate,
    time: match?.[2] ?? '00:00',
  }
}

export interface UseCreateMeetingOptions {
  queryParams: ListMeetingsParams
  managerId: number
  date: string
  onSuccess?: () => void
}

export function useCreateMeeting({
  queryParams,
  managerId,
  date,
  onSuccess,
}: UseCreateMeetingOptions) {
  const queryClient = useQueryClient()

  const mutation = useMeetingsCreate<CreateMeetingContext>({
    mutation: {
      onMutate: async ({ data }) => {
        const optimisticId = -Date.now()
        const { date: meetingDate, time } = parseMeetingDatetime(data.meeting_datetime, date)
        const optimistic: Meeting = {
          id: optimisticId,
          title: data.name,
          comment: data.comment,
          time,
          date: meetingDate,
          managerId,
        }
        prependMeetingToCache(queryClient, queryParams, optimistic)
        return { optimisticId }
      },
      onSuccess: (created, _variables, context) => {
        if (context?.optimisticId != null) {
          removeMeetingFromCache(queryClient, queryParams, context.optimisticId)
        }
        prependMeetingToCache(queryClient, queryParams, fromMeeting(created))
        onSuccess?.()
      },
      onError: (_error, _variables, context) => {
        if (context?.optimisticId != null) {
          removeMeetingFromCache(queryClient, queryParams, context.optimisticId)
        }
      },
    },
  })

  const create = useCallback(
    (values: MeetingFormValues) => {
      mutation.mutate({ data: toMeetingCreateRequest(values, date) })
    },
    [mutation, date],
  )

  return {
    create,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage: mutation.isError ? 'Не удалось создать встречу' : null,
    reset: mutation.reset,
  }
}
