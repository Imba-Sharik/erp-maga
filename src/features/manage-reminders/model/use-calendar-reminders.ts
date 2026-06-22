import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import {
  fromReminder,
  prependReminderToCache,
  removeReminderFromCache,
  replaceReminderInCache,
  toReminderCreateRequest,
  toReminderUpdateRequest,
  type ListRemindersParams,
  type Reminder,
  type ReminderFormValues,
} from '@/entities/reminder'
import { useRemindersCreate } from '@/shared/api/generated/hooks/remindersController/useRemindersCreate'
import { useRemindersDestroy } from '@/shared/api/generated/hooks/remindersController/useRemindersDestroy'
import { useRemindersPartialUpdate } from '@/shared/api/generated/hooks/remindersController/useRemindersPartialUpdate'
import { parseBusinessDatetime } from '@/shared/lib/date'

import { getReminderErrorMessage } from '../lib/get-reminder-error-message'

interface CreateContext {
  optimisticId?: number
}
interface UpdateContext {
  previous?: Reminder
}
interface DeleteContext {
  removed?: Reminder
}

export interface UseCreateReminderOptions {
  queryParams: ListRemindersParams
  onSuccess?: () => void
}

export function useCreateReminder({ queryParams, onSuccess }: UseCreateReminderOptions) {
  const queryClient = useQueryClient()

  const mutation = useRemindersCreate<CreateContext>({
    mutation: {
      onMutate: ({ data }) => {
        const optimisticId = -Date.now()
        const parsed = parseBusinessDatetime(data.reminder_datetime)
        const optimistic: Reminder = {
          id: optimisticId,
          title: data.name,
          comment: data.comment ?? '',
          date: parsed?.date ?? '',
          time: parsed?.time ?? '00:00',
          notifyTelegram: data.is_telegram_reminder ?? false,
          sentAt: null,
          projectId: null,
        }
        prependReminderToCache(queryClient, queryParams, optimistic)
        return { optimisticId }
      },
      onSuccess: (created, _vars, context) => {
        if (context?.optimisticId != null) {
          removeReminderFromCache(queryClient, queryParams, context.optimisticId)
        }
        prependReminderToCache(queryClient, queryParams, fromReminder(created))
        onSuccess?.()
      },
      onError: (_error, _vars, context) => {
        if (context?.optimisticId != null) {
          removeReminderFromCache(queryClient, queryParams, context.optimisticId)
        }
      },
    },
  })

  const create = useCallback(
    (values: ReminderFormValues) => {
      mutation.mutate({ data: toReminderCreateRequest(values) })
    },
    [mutation],
  )

  return {
    create,
    isPending: mutation.isPending,
    errorMessage: mutation.error
      ? getReminderErrorMessage(mutation.error, 'Не удалось создать напоминание')
      : null,
    reset: mutation.reset,
  }
}

export interface UseUpdateReminderOptions {
  queryParams: ListRemindersParams
  reminder: Reminder | null
  onSuccess?: () => void
}

export function useUpdateReminder({ queryParams, reminder, onSuccess }: UseUpdateReminderOptions) {
  const queryClient = useQueryClient()

  const mutation = useRemindersPartialUpdate<UpdateContext>({
    mutation: {
      onMutate: ({ data }) => {
        if (!reminder || !data) return {}
        const parsed = data.reminder_datetime ? parseBusinessDatetime(data.reminder_datetime) : null
        const optimistic: Reminder = {
          ...reminder,
          title: data.name ?? reminder.title,
          comment: data.comment ?? reminder.comment,
          date: parsed?.date ?? reminder.date,
          time: parsed?.time ?? reminder.time,
          notifyTelegram: data.is_telegram_reminder ?? reminder.notifyTelegram,
        }
        replaceReminderInCache(queryClient, queryParams, optimistic)
        return { previous: reminder }
      },
      onSuccess: (updated) => {
        replaceReminderInCache(queryClient, queryParams, fromReminder(updated))
        onSuccess?.()
      },
      onError: (_error, _vars, context) => {
        if (context?.previous) {
          replaceReminderInCache(queryClient, queryParams, context.previous)
        }
      },
    },
  })

  const update = useCallback(
    (values: ReminderFormValues) => {
      if (!reminder) return
      mutation.mutate({ id: reminder.id, data: toReminderUpdateRequest(values) })
    },
    [mutation, reminder],
  )

  return {
    update,
    isPending: mutation.isPending,
    errorMessage: mutation.error
      ? getReminderErrorMessage(mutation.error, 'Не удалось изменить напоминание')
      : null,
    reset: mutation.reset,
  }
}

export interface UseDeleteReminderOptions {
  queryParams: ListRemindersParams
  onSuccess?: () => void
}

export function useDeleteReminder({ queryParams, onSuccess }: UseDeleteReminderOptions) {
  const queryClient = useQueryClient()

  const mutation = useRemindersDestroy<DeleteContext>({
    mutation: {
      onSuccess: () => {
        onSuccess?.()
      },
    },
  })

  const submit = useCallback(
    (reminder: Reminder) => {
      removeReminderFromCache(queryClient, queryParams, reminder.id)
      mutation.mutate(
        { id: reminder.id },
        {
          onError: () => {
            prependReminderToCache(queryClient, queryParams, reminder)
          },
        },
      )
    },
    [mutation, queryClient, queryParams],
  )

  return {
    submit,
    isPending: mutation.isPending,
    errorMessage: mutation.error
      ? getReminderErrorMessage(mutation.error, 'Не удалось удалить напоминание')
      : null,
    reset: mutation.reset,
  }
}
