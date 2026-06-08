import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import {
  replaceMeetingInCache,
  updateMeeting,
  type ListMeetingsParams,
  type Meeting,
  type MeetingFormValues,
} from '@/entities/meeting'

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

  const mutation = useMutation<Meeting, Error, MeetingFormValues, UpdateMeetingContext>({
    mutationFn: async (values) => {
      if (!meeting) throw new Error('Встреча не выбрана')
      return updateMeeting(meeting.id, values)
    },
    onMutate: async (values) => {
      if (!meeting) return {}
      const optimistic: Meeting = { ...meeting, ...values }
      const previous = meeting
      replaceMeetingInCache(queryClient, queryParams, optimistic)
      return { previous }
    },
    onSuccess: (updated) => {
      replaceMeetingInCache(queryClient, queryParams, updated)
      onSuccess?.()
    },
    onError: (_error, _values, context) => {
      if (context?.previous) {
        replaceMeetingInCache(queryClient, queryParams, context.previous)
      }
    },
  })

  const update = useCallback(
    (values: MeetingFormValues) => {
      mutation.mutate(values)
    },
    [mutation],
  )

  return {
    update,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage: mutation.isError ? 'Не удалось сохранить встречу' : null,
    reset: mutation.reset,
  }
}
