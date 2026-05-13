export type ProjectStatus = 'confirmed' | 'signed' | 'expenses'

export type ProjectStage =
  | 'plum_request'
  | 'first_contact'
  | 'calc_ready'
  | 'signed'
  | 'ready'

export interface Project {
  id: string
  title: string
  date: string
  status: ProjectStatus
  stage: ProjectStage
  loft: string
  hall: string
  manager: string
  type: string
  company: string
  phone: string
  email: string
  plumCardUrl: string
  lastUpdate: string
}
