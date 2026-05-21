import type { Manager } from '@/entities/manager'

export interface ManagersTableFilter {
  search: string
  hall: string | null
  loft: string | null
}

export function filterManagersTable(managers: Manager[], filter: ManagersTableFilter): Manager[] {
  const search = filter.search.trim().toLowerCase()

  return managers.filter((manager) => {
    if (filter.loft && !manager.lofts.includes(filter.loft)) return false
    if (filter.hall && !manager.halls.includes(filter.hall)) return false
    if (search && !manager.fullName.toLowerCase().includes(search)) return false
    return true
  })
}
