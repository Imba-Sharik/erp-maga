import { useUserRole } from '@/entities/user-role'

import { AdminAllProjectsPage } from './admin-all-projects-page'
import { DirectorAllProjectsPage } from './director-all-projects-page'
import { ManagerProjectsPage } from './manager-projects-page'

export function ProjectsPage() {
  const role = useUserRole()
  if (role === 'admin') {
    return <AdminAllProjectsPage />
  }
  if (role === 'director') {
    return <DirectorAllProjectsPage />
  }
  return <ManagerProjectsPage />
}
