export type ProjectStatus = 'confirmed' | 'signed' | 'expenses'

export interface Project {
  id: string
  title: string
  date: string
  status: ProjectStatus
  loft: string
  hall: string
  manager: string
  type: string
  company: string
  phone: string
}
