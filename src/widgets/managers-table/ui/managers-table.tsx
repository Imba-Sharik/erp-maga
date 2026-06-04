import { useCallback, useMemo, useState } from 'react'

import {
  buildAssignmentOccupancy,
  useManagersDirectory,
  type Manager,
  type ManagerAssignmentMode,
} from '@/entities/manager'
import { useVenueCatalog } from '@/entities/venue'
import { ConfirmDeleteManagerDialog } from '@/features/confirm-delete-manager'
import { useUpdateManagerAssignments } from '@/features/update-manager-assignments'
import { GridTableHeaderCell, GridTableHeaderLabel, GridTableView } from '@/shared/ui/grid-table'

import {
  buildHallAssignmentOptions,
  buildLoftAssignmentOptions,
  enrichAssignmentOptions,
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
  const { apply, isPendingFor, getErrorFor, clearErrorFor } = useUpdateManagerAssignments()

  const hallOptionsBase = useMemo(() => buildHallAssignmentOptions(halls), [halls])
  const loftOptionsBase = useMemo(() => buildLoftAssignmentOptions(halls), [halls])

  const loftIdToName = useMemo(() => {
    const map = new Map<number, string>()
    for (const hallItem of halls) {
      if (hallItem.loft?.id != null && hallItem.loft.name) {
        map.set(hallItem.loft.id, hallItem.loft.name)
      }
    }
    return map
  }, [halls])

  const catalogDisabled = isCatalogLoading || isCatalogError

  const managers = useMemo(
    () => filterManagersTable(allManagers, { search, hall, loft }),
    [allManagers, search, hall, loft],
  )

  const handleEditOpenChange = useCallback(
    (managerId: string, mode: ManagerAssignmentMode, open: boolean) => {
      if (open) {
        clearErrorFor(managerId, mode)
        setEditing({ managerId, mode })
      } else {
        clearErrorFor(managerId, mode)
        setEditing((prev) => (prev?.managerId === managerId && prev.mode === mode ? null : prev))
      }
    },
    [clearErrorFor],
  )

  const handleApplyAssignments = useCallback(
    async (
      manager: Manager,
      mode: ManagerAssignmentMode,
      selectedKeys: string[],
    ): Promise<{ ok: true } | { ok: false }> => {
      const result = await apply({ manager, mode, selectedKeys, loftIdToName })
      return result.ok ? { ok: true } : { ok: false }
    },
    [apply, loftIdToName],
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
        {managers.map((manager) => {
          const loftOccupancy = buildAssignmentOccupancy(allManagers, manager.id, 'lofts')
          const hallOccupancy = buildAssignmentOccupancy(allManagers, manager.id, 'halls')
          const loftOptions = enrichAssignmentOptions(loftOptionsBase, loftOccupancy)
          const hallOptions = enrichAssignmentOptions(hallOptionsBase, hallOccupancy)

          return (
            <ManagersTableRow
              key={manager.id}
              manager={manager}
              hallOptions={hallOptions}
              loftOptions={loftOptions}
              editing={editing}
              catalogDisabled={catalogDisabled}
              isPendingFor={isPendingFor}
              getErrorFor={getErrorFor}
              onClearError={clearErrorFor}
              onEditOpenChange={handleEditOpenChange}
              onApplyAssignments={handleApplyAssignments}
              onRequestDelete={setDeleteTarget}
            />
          )
        })}
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
