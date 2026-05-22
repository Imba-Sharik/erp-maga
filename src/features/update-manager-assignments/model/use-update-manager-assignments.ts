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

export interface ApplyManagerAssignmentsInput {
  manager: Manager
  mode: ManagerAssignmentMode
  selectedKeys: readonly string[]
}

export function useUpdateManagerAssignments() {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState<{
    managerId: string
    mode: ManagerAssignmentMode
  } | null>(null)

  const createMutation = useHallsManagerAssignmentsCreate()
  const destroyMutation = useHallsManagerAssignmentsDestroy()

  const apply = useCallback(
    async (input: ApplyManagerAssignmentsInput) => {
      const managerId = Number(input.manager.id)
      if (!Number.isFinite(managerId)) return

      const currentKeys = getSelectedAssignmentKeys(input.manager.assignments, input.mode)
      const selectedSet = new Set(input.selectedKeys)
      const toAdd = [...selectedSet].filter((key) => !currentKeys.has(key))
      const toRemove = [...currentKeys].filter((key) => !selectedSet.has(key))

      if (toAdd.length === 0 && toRemove.length === 0) return

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

  return {
    apply,
    isPendingFor,
  }
}
