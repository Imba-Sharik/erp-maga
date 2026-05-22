import type { ManagerDirectory } from '@/shared/api/generated/types/ManagerDirectory'

import type { Manager, ManagerAssignment } from '../model/types'

function parseDecimal(value: string): number {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function mapAssignment(dto: ManagerDirectory['assignments'][number]): ManagerAssignment {
  return {
    id: dto.id,
    hallId: dto.hall_id,
    hallName: dto.hall_name,
    loftId: dto.loft_id,
    loftName: dto.loft_name,
    label: dto.label,
  }
}

function uniqueNames(values: readonly (string | null)[]): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))]
}

export function fromManagerDirectory(dto: ManagerDirectory): Manager {
  const assignments = dto.assignments.map(mapAssignment)

  return {
    id: String(dto.id),
    fullName: dto.full_name,
    assignments,
    lofts: uniqueNames(assignments.map((a) => a.loftName)),
    halls: uniqueNames(assignments.map((a) => a.hallName)),
    activeProjectsCount: dto.active_projects_count,
    closedProjectsCount: dto.closed_projects_count,
    salesTotal: parseDecimal(dto.sales_total),
    bonusTotal: parseDecimal(dto.bonuses_total),
  }
}
