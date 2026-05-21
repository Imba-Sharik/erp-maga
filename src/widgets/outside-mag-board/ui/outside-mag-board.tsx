import { useMemo, useState } from 'react'

import type { Project, ProjectBackOrigin } from '@/entities/project'
import { ReturnProjectFromOutsideMagDialog } from '@/features/return-project-from-outside-mag'
import {
  EMPTY_COLUMN_FILTERS,
  filterProjectsTable,
  ProjectsTableView,
  useOutsideMagTableQuery,
  type ColumnFilterKey,
  type ColumnFilters,
} from '@/widgets/projects-table'

import { env } from '@/shared/config/env'
import type { BoardListParams } from '@/widgets/projects-board/lib/kanban-board-query'
import { OUTSIDE_MAG_MOCK_PROJECTS } from '../model/outside-mag-mock-projects'
import { OutsideMagSearchToolbar } from './outside-mag-search-toolbar'
import { ReturnFromOutsideMagButton } from './return-from-outside-mag-button'

const isOutsideMagMocksEnabled = import.meta.env.DEV || env.USE_MOCKS

const OUTSIDE_MAG_BACK: ProjectBackOrigin = {
  to: '/outside-mag',
  label: 'Вне контура MAG',
}

interface OutsideMagBoardProps {
  listDateParams: BoardListParams
}

export function OutsideMagBoard({ listDateParams }: OutsideMagBoardProps) {
  const [search, setSearch] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>(EMPTY_COLUMN_FILTERS)
  const [returnTarget, setReturnTarget] = useState<Project | null>(null)

  const query = useOutsideMagTableQuery(listDateParams, {
    enabled: !isOutsideMagMocksEnabled,
  })

  const projects = isOutsideMagMocksEnabled ? OUTSIDE_MAG_MOCK_PROJECTS : query.projects
  const hasNextPage = isOutsideMagMocksEnabled ? false : query.hasNextPage
  const isLoading = isOutsideMagMocksEnabled ? false : query.isLoading
  const isError = isOutsideMagMocksEnabled ? false : query.isError
  const isFetchingNextPage = isOutsideMagMocksEnabled ? false : query.isFetchingNextPage
  const fetchNextPage = query.fetchNextPage

  const managerOptions = useMemo(() => {
    const names = new Set<string>()
    for (const project of projects) {
      if (project.manager) names.add(project.manager)
    }
    return [...names].sort((a, b) => a.localeCompare(b, 'ru'))
  }, [projects])

  const filtered = useMemo(
    () =>
      filterProjectsTable(projects, {
        search,
        columns: columnFilters,
        columnView: 'outside-mag',
      }),
    [projects, search, columnFilters],
  )

  const handleColumnFilterChange = (key: ColumnFilterKey, value: string | null) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6">
      <OutsideMagSearchToolbar search={search} onChangeSearch={setSearch} />
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <ProjectsTableView
          projects={filtered}
          columnView="outside-mag"
          columnFilters={columnFilters}
          managerOptions={managerOptions}
          onColumnFilterChange={handleColumnFilterChange}
          isLoading={isLoading}
          isError={isError}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={fetchNextPage}
          backOrigin={OUTSIDE_MAG_BACK}
          renderRowAction={(project) => (
            <ReturnFromOutsideMagButton onClick={() => setReturnTarget(project)} />
          )}
        />
      </div>

      <ReturnProjectFromOutsideMagDialog
        open={returnTarget !== null}
        onOpenChange={(open) => {
          if (!open) setReturnTarget(null)
        }}
        project={returnTarget}
      />
    </div>
  )
}
