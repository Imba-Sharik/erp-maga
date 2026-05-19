import type { ProjectCreateRequest } from '@/shared/api/generated/types/ProjectCreateRequest'

import type { CreateProjectFormValues } from './create-project-form-values'

export function toProjectCreateRequest(values: CreateProjectFormValues): ProjectCreateRequest {
  return {
    title: values.title.trim(),
    event_type: Number(values.eventType),
    loft: values.loft,
    hall: values.hall,
  }
}
