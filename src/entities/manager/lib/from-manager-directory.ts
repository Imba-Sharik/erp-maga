import type { ManagerDirectory } from '@/shared/api/generated/types/ManagerDirectory'

import type { Manager, ManagerAssignment } from '../model/types'

function parseDecimal(value: string): number {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function mapAssignment(dto: ManagerDirectory['assignments'][number]): ManagerAssignment {
  return {
    id: dto.id,
    hallId: dto.hall.id,
    hallName: dto.hall.name,
    loftId: dto.loft?.id ?? null,
    loftName: dto.loft?.name ?? null,
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
    bonusTotal: parseDecimal(dto.final_bonus_total),
  }
}
