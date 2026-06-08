import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import {
  createMeeting,
  prependMeetingToCache,
  removeMeetingFromCache,
  type ListMeetingsParams,
  type Meeting,
  type MeetingFormValues,
} from '@/entities/meeting'

type CreateMeetingContext = {
  optimisticId: string
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

  const mutation = useMutation<Meeting, Error, MeetingFormValues, CreateMeetingContext>({
    mutationFn: async (values) =>
      createMeeting({
        title: values.title,
        comment: values.comment,
        time: values.time,
        date,
        managerId,
      }),
    onMutate: async (values) => {
      const optimisticId = `optimistic-${Date.now()}`
      const optimistic: Meeting = {
        id: optimisticId,
        title: values.title,
        comment: values.comment,
        time: values.time,
        date,
        managerId,
      }
      prependMeetingToCache(queryClient, queryParams, optimistic)
      return { optimisticId }
    },
    onSuccess: (created, _values, context) => {
      if (context?.optimisticId) {
        removeMeetingFromCache(queryClient, queryParams, context.optimisticId)
      }
      prependMeetingToCache(queryClient, queryParams, created)
      onSuccess?.()
    },
    onError: (_error, _values, context) => {
      if (context?.optimisticId) {
        removeMeetingFromCache(queryClient, queryParams, context.optimisticId)
      }
    },
  })

  const create = useCallback(
    (values: MeetingFormValues) => {
      mutation.mutate(values)
    },
    [mutation],
  )

  return {
    create,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage: mutation.isError ? 'Не удалось создать встречу' : null,
    reset: mutation.reset,
  }
}
