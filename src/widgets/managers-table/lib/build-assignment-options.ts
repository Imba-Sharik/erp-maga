import { hallOnlyAssignmentKey, loftAssignmentKey } from '@/entities/manager'
import type { VenueHall } from '@/entities/venue'

export type ManagerAssignmentOption = {
  key: string
  label: string
}

function sortByLabelRu(a: ManagerAssignmentOption, b: ManagerAssignmentOption): number {
  return a.label.localeCompare(b.label, 'ru')
}

export function buildHallAssignmentOptions(halls: readonly VenueHall[]): ManagerAssignmentOption[] {
  return halls
    .map((hall) => ({
      key: hallOnlyAssignmentKey(hall.id),
      label: hall.name,
    }))
    .sort(sortByLabelRu)
}

export function buildLoftAssignmentOptions(halls: readonly VenueHall[]): ManagerAssignmentOption[] {
  return halls
    .filter(
      (hall): hall is VenueHall & { loft_id: number; loft_name: string } =>
        hall.loft_id != null && Boolean(hall.loft_name),
    )
    .map((hall) => ({
      key: loftAssignmentKey(hall.id, hall.loft_id),
      label: `${hall.loft_name} — ${hall.name}`,
    }))
    .sort(sortByLabelRu)
}
