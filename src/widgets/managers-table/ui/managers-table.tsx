import { useCallback, useMemo, useState } from 'react'

import { useManagersDirectory, type Manager, type ManagerAssignmentMode } from '@/entities/manager'
import { useVenueCatalog } from '@/entities/venue'
import { ConfirmDeleteManagerDialog } from '@/features/confirm-delete-manager'
import { useUpdateManagerAssignments } from '@/features/update-manager-assignments'
import { GridTableHeaderCell, GridTableHeaderLabel, GridTableView } from '@/shared/ui/grid-table'

import {
  buildHallAssignmentOptions,
  buildLoftAssignmentOptions,
} from '../lib/build-assignment-options'
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
  const [deleteTarget, setDeleteTarget] = useState<Manager | null>(null)
  const [editing, setEditing] = useState<{
    managerId: string
    mode: ManagerAssignmentMode
  } | null>(null)

  const { managers: allManagers, isLoading, isError } = useManagersDirectory()
  const { halls, isLoading: isCatalogLoading, isError: isCatalogError } = useVenueCatalog()
  const { apply, isPendingFor } = useUpdateManagerAssignments()

  const hallOptions = useMemo(() => buildHallAssignmentOptions(halls), [halls])
  const loftOptions = useMemo(() => buildLoftAssignmentOptions(halls), [halls])
  const catalogDisabled = isCatalogLoading || isCatalogError

  const managers = useMemo(
    () => filterManagersTable(allManagers, { search, hall, loft }),
    [allManagers, search, hall, loft],
  )

  const handleEditOpenChange = useCallback(
    (managerId: string, mode: ManagerAssignmentMode, open: boolean) => {
      if (open) setEditing({ managerId, mode })
      else setEditing((prev) => (prev?.managerId === managerId && prev.mode === mode ? null : prev))
    },
    [],
  )

  const handleApplyAssignments = useCallback(
    (manager: Manager, mode: ManagerAssignmentMode, selectedKeys: string[]) => {
      void apply({ manager, mode, selectedKeys })
    },
    [apply],
  )

  const emptyMessage = isError ? 'Не удалось загрузить список менеджеров.' : 'Менеджеры не найдены.'

  return (
    <>
      <GridTableView
        minWidth={MANAGERS_TABLE_MIN_WIDTH}
        gridTemplate={MANAGERS_TABLE_GRID_TEMPLATE}
        header={<ManagersTableHeader />}
        isEmpty={!isLoading && managers.length === 0}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        skeletonColumnCount={MANAGERS_TABLE_COLUMN_COUNT}
      >
        {managers.map((manager) => (
          <ManagersTableRow
            key={manager.id}
            manager={manager}
            hallOptions={hallOptions}
            loftOptions={loftOptions}
            editing={editing}
            catalogDisabled={catalogDisabled}
            isPendingFor={isPendingFor}
            onEditOpenChange={handleEditOpenChange}
            onApplyAssignments={handleApplyAssignments}
            onRequestDelete={setDeleteTarget}
          />
        ))}
      </GridTableView>

      <ConfirmDeleteManagerDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        managerId={deleteTarget?.id ?? ''}
        managerName={deleteTarget?.fullName ?? ''}
        onConfirmed={() => setDeleteTarget(null)}
      />
    </>
  )
}
