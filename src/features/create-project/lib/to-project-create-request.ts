import type { ProjectCreateRequest } from '@/shared/api/generated/types/ProjectCreateRequest'

import type { CreateProjectFormValues } from './create-project-form-values'

export function toProjectCreateRequest(values: CreateProjectFormValues): ProjectCreateRequest {
  const hallId = Number(values.hallId)
  if (!Number.isFinite(hallId)) {
    throw new Error('Invalid hall id')
  }
  const loftIdNum = values.loftId ? Number(values.loftId) : NaN

  return {
    title: values.title.trim(),
    event_type: Number(values.eventType),
    hall_id: hallId,
    ...(Number.isFinite(loftIdNum) ? { loft_id: loftIdNum } : {}),
  }
}
