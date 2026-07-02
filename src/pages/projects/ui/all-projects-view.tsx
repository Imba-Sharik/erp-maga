import { useMemo, useState } from 'react'

import { PROJECTS_LIST_DEFAULT_ORDERING } from '@/shared/constants'
import { ViewModeToggle, type ViewMode } from '@/shared/ui/view-mode-toggle'
import { ProjectsBoard } from '@/widgets/projects-board'
import { ProjectsTable } from '@/widgets/projects-table'

interface AllProjectsViewProps {
  /** Стартовый вид (менеджер — канбан, руководитель — таблица) */
  defaultView?: ViewMode
  onAddProject?: () => void
  /** Редактирование ответственного менеджера в таблице (руководитель — да) */
  managerEditable?: boolean
}

/**
 * «Все проекты» с переключателем канбан ⇄ таблица. Вид — локальный useState (не в URL,
 * как в «Закрытии»); фильтры канбана и таблицы живут в своих независимых URL-скоупах.
 */
export function AllProjectsView({
  defaultView = 'kanban',
  onAddProject,
  managerEditable,
}: AllProjectsViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView)
  const listDateParams = useMemo(() => ({ ordering: PROJECTS_LIST_DEFAULT_ORDERING }), [])
  const toggle = <ViewModeToggle value={viewMode} onChange={setViewMode} />

  return viewMode === 'kanban' ? (
    <ProjectsBoard
      listDateParams={listDateParams}
      onAddProject={onAddProject}
      viewModeToggle={toggle}
    />
  ) : (
    <ProjectsTable
      onAddProject={onAddProject}
      managerEditable={managerEditable}
      viewModeToggle={toggle}
    />
  )
}
