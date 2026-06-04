import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

import type { ProjectBackOrigin } from '@/entities/project'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { Input } from '@/shared/ui/input'
import {
  EMPTY_COLUMN_FILTERS,
  filterProjectsTable,
  ProjectsTableView,
  type ColumnFilterKey,
} from '@/widgets/projects-table'

import { useRequestsTableQuery, type RequestsTableVariant } from '../lib/use-requests-table-query'

const VARIANT_CONFIG = {
  open: {
    columnView: 'requests',
    backOrigin: { to: '/requests', label: 'Запросы' },
  },
  closed: {
    columnView: 'closed-requests',
    backOrigin: { to: '/closed-requests', label: 'Закрытые запросы' },
  },
} satisfies Record<
  RequestsTableVariant,
  { columnView: 'requests' | 'closed-requests'; backOrigin: ProjectBackOrigin }
>

interface RequestsTableProps {
  variant: RequestsTableVariant
}

/** Таблица запросов бухгалтера: `open` — ждут подтверждения, `closed` — уже закрыты. */
export function RequestsTable({ variant }: RequestsTableProps) {
  const [search, setSearch] = useState('')
  const [columnFilters, setColumnFilters] = useState(EMPTY_COLUMN_FILTERS)
  const config = VARIANT_CONFIG[variant]
  const debouncedSearch = useDebouncedValue(search)

  const { projects, hasNextPage, isLoading, isError, isFetchingNextPage, fetchNextPage } =
    useRequestsTableQuery(variant, debouncedSearch, columnFilters.plumEventStatus)

  const filtered = useMemo(
    () => filterProjectsTable(projects, { columns: columnFilters }),
    [projects, columnFilters],
  )

  const handleColumnFilterChange = (key: ColumnFilterKey, value: string | null) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-5">
      <div className="relative w-full shrink-0 md:w-75">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#ACACAC]" />
        <Input
          type="search"
          placeholder="Поиск проектов"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 rounded-[10px] border-[#B1B1B1] bg-white pl-9 placeholder:text-[#ACACAC]"
        />
      </div>
      <ProjectsTableView
        projects={filtered}
        columnView={config.columnView}
        columnFilters={columnFilters}
        managerFilterOptions={[]}
        directoryOptions={[]}
        onColumnFilterChange={handleColumnFilterChange}
        isLoading={isLoading}
        isError={isError}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
        backOrigin={config.backOrigin}
      />
    </div>
  )
}
