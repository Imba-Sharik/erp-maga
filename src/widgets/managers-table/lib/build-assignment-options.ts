import {
  hallOnlyAssignmentKey,
  loftAssignmentKey,
  type AssignmentOccupant,
} from '@/entities/manager'
import type { VenueHall } from '@/entities/venue'

export type ManagerAssignmentOption = {
  key: string
  label: string
  occupiedBy?: string
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
      (hall): hall is VenueHall & { loft: { id: number; name: string } } =>
        hall.loft != null && Boolean(hall.loft.name),
    )
    .map((hall) => ({
      key: loftAssignmentKey(hall.id, hall.loft.id),
      label: `${hall.loft.name} — ${hall.name}`,
    }))
    .sort(sortByLabelRu)
}

export function enrichAssignmentOptions(
  options: readonly ManagerAssignmentOption[],
  occupancy: ReadonlyMap<string, AssignmentOccupant>,
): ManagerAssignmentOption[] {
  return options.map((option) => {
    const occupant = occupancy.get(option.key)
    if (!occupant) return option
    return { ...option, occupiedBy: occupant.fullName }
  })
}
