import { deriveCityIdsFromHallIds, type VenueHall } from '@/entities/venue'
import type { ProjectCreateRequest } from '@/shared/api/generated/types/ProjectCreateRequest'

import type { CreateProjectFormValues } from './create-project-form-values'

export function toProjectCreateRequest(
  values: CreateProjectFormValues,
  halls: readonly VenueHall[],
): ProjectCreateRequest {
  const hallIds = values.halls.map(Number).filter((id) => Number.isInteger(id) && id > 0)

  const request: ProjectCreateRequest = {
    title: values.title.trim(),
    event_type: Number(values.eventType),
    event_date: values.eventDate,
    hall_ids: hallIds,
    city_ids: deriveCityIdsFromHallIds(halls, hallIds),
  }

  const magManagerId = values.magManagerId ? Number(values.magManagerId) : NaN
  if (Number.isFinite(magManagerId)) {
    request.mag_manager_id = magManagerId
  }

  return request
}
