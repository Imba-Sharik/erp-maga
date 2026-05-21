import { useCallback } from 'react'

import type { PreprojectStage } from '@/entities/project'

import { buildReturnFromOutsideMagBody } from '../lib/build-return-from-outside-mag-body'

export interface ReturnProjectFromOutsideMagInput {
  projectId: string
  targetStage: PreprojectStage
}

interface UseReturnProjectFromOutsideMagOptions {
  onSuccess?: () => void
}

/**
 * TODO: POST /projects/{id}/transitions/ с телом из buildReturnFromOutsideMagBody.
 */
export function useReturnProjectFromOutsideMag({
  onSuccess,
}: UseReturnProjectFromOutsideMagOptions = {}) {
  const submit = useCallback(
    (input: ReturnProjectFromOutsideMagInput) => {
      const _body = buildReturnFromOutsideMagBody(input.targetStage)
      void _body
      onSuccess?.()
    },
    [onSuccess],
  )

  return {
    submit,
    isPending: false,
    isError: false,
    errorMessage: null as string | null,
    reset: () => {},
  }
}
