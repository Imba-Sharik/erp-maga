export interface Manager {
  id: string
  fullName: string
  lofts: readonly string[]
  halls: readonly string[]
  activeProjectsCount: number
  closedProjectsCount: number
  salesTotal: number
  bonusTotal: number
}
