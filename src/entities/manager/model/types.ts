export interface ManagerAssignment {
  id: number
  hallId: number
  hallName: string
  loftId: number | null
  loftName: string | null
  label: string
}

export interface Manager {
  id: string
  fullName: string
  assignments: readonly ManagerAssignment[]
  lofts: readonly string[]
  halls: readonly string[]
  activeProjectsCount: number
  closedProjectsCount: number
  salesTotal: number
  bonusTotal: number
}
