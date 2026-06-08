import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import {
  deleteMeeting,
  prependMeetingToCache,
  removeMeetingFromCache,
  type ListMeetingsParams,
  type Meeting,
} from '@/entities/meeting'

type DeleteMeetingContext = {
  removed?: Meeting
}

export interface UseDeleteMeetingOptions {
  queryParams: ListMeetingsParams
  onSuccess?: () => void
}

export function useDeleteMeeting({ queryParams, onSuccess }: UseDeleteMeetingOptions) {
  const queryClient = useQueryClient()

  const mutation = useMutation<void, Error, Meeting, DeleteMeetingContext>({
    mutationFn: async (meeting) => {
      await deleteMeeting(meeting.id)
    },
    onMutate: async (meeting) => {
      removeMeetingFromCache(queryClient, queryParams, meeting.id)
      return { removed: meeting }
    },
    onSuccess: () => {
      onSuccess?.()
    },
    onError: (_error, _meeting, context) => {
      if (context?.removed) {
        prependMeetingToCache(queryClient, queryParams, context.removed)
      }
    },
  })

  const submit = useCallback(
    (meeting: Meeting) => {
      mutation.mutate(meeting)
    },
    [mutation],
  )

  return {
    submit,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage: mutation.isError ? 'Не удалось удалить встречу' : null,
    reset: mutation.reset,
  }
}
