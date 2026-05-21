import { useCallback } from 'react'

import type { OutsideMagReason } from '@/entities/project'

import { buildOutsideMagTransitionBody } from '../lib/build-outside-mag-transition-body'

export interface MoveProjectOutsideMagInput {
  projectId: string
  reason: OutsideMagReason
}

interface UseMoveProjectOutsideMagOptions {
  onSuccess?: () => void
}

/**
 * TODO: POST /projects/{id}/transitions/ с телом из buildOutsideMagTransitionBody.
 */
export function useMoveProjectOutsideMag({ onSuccess }: UseMoveProjectOutsideMagOptions = {}) {
  const submit = useCallback(
    (input: MoveProjectOutsideMagInput) => {
      const _body = buildOutsideMagTransitionBody(input.reason)
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
