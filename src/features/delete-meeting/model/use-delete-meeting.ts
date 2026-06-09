import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef } from 'react'

import {
  prependMeetingToCache,
  removeMeetingFromCache,
  type ListMeetingsParams,
  type Meeting,
} from '@/entities/meeting'
import { useMeetingsDestroy } from '@/shared/api/generated/hooks/meetingsController/useMeetingsDestroy'

type DeleteMeetingContext = {
  removed?: Meeting
}

export interface UseDeleteMeetingOptions {
  queryParams: ListMeetingsParams
  onSuccess?: () => void
}

export function useDeleteMeeting({ queryParams, onSuccess }: UseDeleteMeetingOptions) {
  const queryClient = useQueryClient()
  const pendingMeetingRef = useRef<Meeting | null>(null)

  const mutation = useMeetingsDestroy<DeleteMeetingContext>({
    mutation: {
      onMutate: async () => {
        const meeting = pendingMeetingRef.current
        if (!meeting) return {}
        removeMeetingFromCache(queryClient, queryParams, meeting.id)
        return { removed: meeting }
      },
      onSuccess: () => {
        pendingMeetingRef.current = null
        onSuccess?.()
      },
      onError: (_error, _variables, context) => {
        pendingMeetingRef.current = null
        if (context?.removed) {
          prependMeetingToCache(queryClient, queryParams, context.removed)
        }
      },
    },
  })

  const submit = useCallback(
    (meeting: Meeting) => {
      pendingMeetingRef.current = meeting
      mutation.mutate({ id: meeting.id })
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
