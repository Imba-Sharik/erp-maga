import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import {
  fromMeeting,
  meetingHallsForHallIds,
  replaceMeetingInCache,
  toMeetingUpdateRequest,
  type ListMeetingsParams,
  type Meeting,
  type MeetingFormValues,
} from '@/entities/meeting'
import { useMeetingsPartialUpdate } from '@/shared/api/generated/hooks/meetingsController/useMeetingsPartialUpdate'
import { formatBusinessTime } from '@/shared/lib/date'

type UpdateMeetingContext = {
  previous?: Meeting
}

export interface UseUpdateMeetingOptions {
  queryParams: ListMeetingsParams
  meeting: Meeting | null
  onSuccess?: () => void
}

export function useUpdateMeeting({ queryParams, meeting, onSuccess }: UseUpdateMeetingOptions) {
  const queryClient = useQueryClient()

  const mutation = useMeetingsPartialUpdate<UpdateMeetingContext>({
    mutation: {
      onMutate: async ({ data }) => {
        if (!meeting || !data) return {}
        const optimistic: Meeting = {
          ...meeting,
          title: data.name ?? meeting.title,
          eventType: data.type ?? meeting.eventType,
          comment: data.comment ?? meeting.comment,
          time: data.meeting_datetime ? formatBusinessTime(data.meeting_datetime) : meeting.time,
          halls:
            data.hall_ids != null
              ? meetingHallsForHallIds(meeting.halls, data.hall_ids)
              : meeting.halls,
        }
        const previous = meeting
        replaceMeetingInCache(queryClient, queryParams, optimistic)
        return { previous }
      },
      onSuccess: (updated) => {
        replaceMeetingInCache(queryClient, queryParams, fromMeeting(updated))
        onSuccess?.()
      },
      onError: (_error, _variables, context) => {
        if (context?.previous) {
          replaceMeetingInCache(queryClient, queryParams, context.previous)
        }
      },
    },
  })

  const update = useCallback(
    (values: MeetingFormValues) => {
      if (!meeting) return
      mutation.mutate({
        id: meeting.id,
        data: toMeetingUpdateRequest(values, meeting),
      })
    },
    [mutation, meeting],
  )

  return {
    update,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage: mutation.isError ? 'Не удалось сохранить встречу' : null,
    reset: mutation.reset,
  }
}
