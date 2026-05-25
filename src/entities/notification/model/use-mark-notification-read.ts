import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { useNotificationsMarkReadCreate } from '@/shared/api/generated/hooks/notificationsController/useNotificationsMarkReadCreate'

import { notificationsListQueryKey } from '../lib/notifications-query'

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  const mutation = useNotificationsMarkReadCreate({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: notificationsListQueryKey() })
      },
    },
  })

  const markRead = useCallback(
    (id: number) => {
      mutation.mutate({ data: { ids: [id] } })
    },
    [mutation],
  )

  const markAllRead = useCallback(() => {
    mutation.mutate({ data: {} })
  }, [mutation])

  return {
    markRead,
    markAllRead,
    isPending: mutation.isPending,
  }
}
