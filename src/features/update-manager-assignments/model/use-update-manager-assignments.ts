import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import {
  findAssignmentsByHallId,
  getSelectedHallIds,
  invalidateManagersDirectory,
  type Manager,
  type ManagerAssignmentMode,
} from '@/entities/manager'
import { hallsManagerAssignmentsBulkDestroy } from '@/shared/api/generated/clients/hallsController/hallsManagerAssignmentsBulkDestroy'
import { useHallsManagerAssignmentsCreate } from '@/shared/api/generated/hooks/hallsController/useHallsManagerAssignmentsCreate'
import { toast } from '@/shared/ui/toast'

import { getAssignmentErrorMessage } from '../lib/get-assignment-error-message'

export interface ApplyManagerAssignmentsInput {
  manager: Manager
  /** Режим ячейки, инициировавшей сохранение — для индикатора pending/ошибки. */
  mode: ManagerAssignmentMode
  /** Целевой набор id залов менеджера (источник правды). */
  targetHallIds: readonly number[]
}

export type ApplyManagerAssignmentsResult = { ok: true } | { ok: false; errorMessage: string }

type AssignmentErrorState = {
  managerId: string
  mode: ManagerAssignmentMode
  message: string
}

export function useUpdateManagerAssignments() {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState<{
    managerId: string
    mode: ManagerAssignmentMode
  } | null>(null)
  const [assignmentError, setAssignmentError] = useState<AssignmentErrorState | null>(null)

  const createMutation = useHallsManagerAssignmentsCreate()

  const clearErrorFor = useCallback((managerId: string, mode: ManagerAssignmentMode) => {
    setAssignmentError((prev) =>
      prev?.managerId === managerId && prev.mode === mode ? null : prev,
    )
  }, [])

  const apply = useCallback(
    async (input: ApplyManagerAssignmentsInput): Promise<ApplyManagerAssignmentsResult> => {
      const managerId = Number(input.manager.id)
      if (!Number.isFinite(managerId)) return { ok: true }

      const currentHallIds = new Set(getSelectedHallIds(input.manager.assignments))
      const targetHallIds = new Set(input.targetHallIds)
      const toAdd = [...targetHallIds].filter((hallId) => !currentHallIds.has(hallId))
      const toRemove = [...currentHallIds].filter((hallId) => !targetHallIds.has(hallId))

      if (toAdd.length === 0 && toRemove.length === 0) return { ok: true }

      setAssignmentError(null)
      setPending({ managerId: input.manager.id, mode: input.mode })

      try {
        const idsToRemove = toRemove.flatMap((hallId) =>
          findAssignmentsByHallId(input.manager.assignments, hallId).map((a) => a.id),
        )
        if (idsToRemove.length > 0) {
          await hallsManagerAssignmentsBulkDestroy({ data: { ids: idsToRemove } })
        }
        if (toAdd.length > 0) {
          // loft не передаём — бэкенд привяжет его сам по залу.
          await createMutation.mutateAsync({
            data: { manager: managerId, hall_ids: toAdd },
          })
        }
        toast.success('Залы менеджера обновлены')
        return { ok: true }
      } catch (error) {
        const errorMessage = getAssignmentErrorMessage(error)
        setAssignmentError({
          managerId: input.manager.id,
          mode: input.mode,
          message: errorMessage,
        })
        return { ok: false, errorMessage }
      } finally {
        setPending(null)
        invalidateManagersDirectory(queryClient)
      }
    },
    [createMutation, queryClient],
  )

  const isPendingFor = useCallback(
    (managerId: string, mode: ManagerAssignmentMode) =>
      pending?.managerId === managerId && pending.mode === mode,
    [pending],
  )

  const getErrorFor = useCallback(
    (managerId: string, mode: ManagerAssignmentMode): string | null => {
      if (assignmentError?.managerId === managerId && assignmentError.mode === mode) {
        return assignmentError.message
      }
      return null
    },
    [assignmentError],
  )

  return {
    apply,
    isPendingFor,
    getErrorFor,
    clearErrorFor,
  }
}
