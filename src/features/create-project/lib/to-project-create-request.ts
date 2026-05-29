import type { ProjectCreateRequest } from '@/shared/api/generated/types/ProjectCreateRequest'
import type { VenueHall } from '@/entities/venue'

import type { CreateProjectFormValues } from './create-project-form-values'

export function toProjectCreateRequest(
  values: CreateProjectFormValues,
  halls: VenueHall[],
): ProjectCreateRequest {
  return {
    title: values.title.trim(),
    event_type: Number(values.eventType),
    event_date: values.eventDate,
    hall_ids: halls.map((hall) => hall.id),
  }
}
