import { useMemo, useState } from 'react'

import { MOCK_MANAGERS } from '@/entities/manager'
import { GridTableHeaderCell, GridTableHeaderLabel, GridTableView } from '@/shared/ui/grid-table'

import { filterManagersTable } from '../lib/filter-managers-table'
import {
  MANAGERS_TABLE_COLUMN_COUNT,
  MANAGERS_TABLE_GRID_TEMPLATE,
  MANAGERS_TABLE_MIN_WIDTH,
} from '../lib/managers-table-columns'
import { ManagersTableRow } from './managers-table-row'

interface ManagersTableProps {
  search: string
  hall: string | null
  loft: string | null
}

function ManagersTableHeader() {
  return (
    <>
      <GridTableHeaderLabel>Ответственный менеджер</GridTableHeaderLabel>
      <GridTableHeaderLabel>LOFT</GridTableHeaderLabel>
      <GridTableHeaderLabel>Залы менеджера</GridTableHeaderLabel>
      <GridTableHeaderLabel>Действующих проектов</GridTableHeaderLabel>
      <GridTableHeaderLabel>Закрытых проектов</GridTableHeaderLabel>
      <GridTableHeaderLabel>Сумма продаж</GridTableHeaderLabel>
      <GridTableHeaderLabel>Сумма бонусов</GridTableHeaderLabel>
      <GridTableHeaderCell aria-hidden />
    </>
  )
}

export function ManagersTable({ search, hall, loft }: ManagersTableProps) {
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => new Set())

  const managers = useMemo(() => {
    const visible = MOCK_MANAGERS.filter((m) => !deletedIds.has(m.id))
    return filterManagersTable(visible, { search, hall, loft })
  }, [search, hall, loft, deletedIds])

  const handleDelete = (id: string) => {
    setDeletedIds((prev) => new Set(prev).add(id))
  }

  return (
    <GridTableView
      minWidth={MANAGERS_TABLE_MIN_WIDTH}
      gridTemplate={MANAGERS_TABLE_GRID_TEMPLATE}
      header={<ManagersTableHeader />}
      isEmpty={managers.length === 0}
      emptyMessage="Менеджеры не найдены."
      skeletonColumnCount={MANAGERS_TABLE_COLUMN_COUNT}
    >
      {managers.map((manager) => (
        <ManagersTableRow key={manager.id} manager={manager} onDelete={handleDelete} />
      ))}
    </GridTableView>
  )
}
