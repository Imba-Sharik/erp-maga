import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import {
  findAssignmentByKey,
  getSelectedAssignmentKeys,
  invalidateManagersDirectory,
  parseAssignmentKey,
  type Manager,
  type ManagerAssignmentMode,
} from '@/entities/manager'
import { useHallsManagerAssignmentsCreate } from '@/shared/api/generated/hooks/hallsController/useHallsManagerAssignmentsCreate'
import { useHallsManagerAssignmentsDestroy } from '@/shared/api/generated/hooks/hallsController/useHallsManagerAssignmentsDestroy'

import { getAssignmentConflictErrorMessage } from '../lib/get-assignment-conflict-error-message'

export interface ApplyManagerAssignmentsInput {
  manager: Manager
  mode: ManagerAssignmentMode
  selectedKeys: readonly string[]
  loftIdToName?: ReadonlyMap<number, string>
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
  const destroyMutation = useHallsManagerAssignmentsDestroy()

  const clearErrorFor = useCallback((managerId: string, mode: ManagerAssignmentMode) => {
    setAssignmentError((prev) =>
      prev?.managerId === managerId && prev.mode === mode ? null : prev,
    )
  }, [])

  const apply = useCallback(
    async (input: ApplyManagerAssignmentsInput): Promise<ApplyManagerAssignmentsResult> => {
      const managerId = Number(input.manager.id)
      if (!Number.isFinite(managerId)) return { ok: true }

      const currentKeys = getSelectedAssignmentKeys(input.manager.assignments, input.mode)
      const selectedSet = new Set(input.selectedKeys)
      const toAdd = [...selectedSet].filter((key) => !currentKeys.has(key))
      const toRemove = [...currentKeys].filter((key) => !selectedSet.has(key))

      if (toAdd.length === 0 && toRemove.length === 0) return { ok: true }

      setAssignmentError(null)
      setPending({ managerId: input.manager.id, mode: input.mode })

      try {
        for (const key of toRemove) {
          const assignment = findAssignmentByKey(input.manager.assignments, key)
          if (assignment) {
            await destroyMutation.mutateAsync({ id: assignment.id })
          }
        }
        for (const key of toAdd) {
          const { hallId, loftId } = parseAssignmentKey(key)
          await createMutation.mutateAsync({
            data: {
              hall: hallId,
              loft: loftId,
              manager: managerId,
            },
          })
        }
        return { ok: true }
      } catch (error) {
        const errorMessage = getAssignmentConflictErrorMessage(error, input.loftIdToName)
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
    [createMutation, destroyMutation, queryClient],
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
