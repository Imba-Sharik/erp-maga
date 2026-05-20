import { useUserRole } from '@/entities/user-role'

import { DirectorAllProjectsPage } from './director-all-projects-page'
import { ManagerProjectsPage } from './manager-projects-page'

export function ProjectsPage() {
  const role = useUserRole()
  if (role === 'director') {
    return <DirectorAllProjectsPage />
  }
  return <ManagerProjectsPage />
}
