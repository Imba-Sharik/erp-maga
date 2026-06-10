import { useCallback, useMemo, useState } from 'react'

import {
  getSelectedHallIds,
  useManagersDirectory,
  type Manager,
  type ManagerAssignmentMode,
} from '@/entities/manager'
import { applyLoftSelection, deriveSelectedLoftIds, useVenueCatalog } from '@/entities/venue'
import { ConfirmDeleteManagerDialog } from '@/features/confirm-delete-manager'
import { useUpdateManagerAssignments } from '@/features/update-manager-assignments'
import { GridTableHeaderCell, GridTableHeaderLabel, GridTableView } from '@/shared/ui/grid-table'

import {
  buildHallAssignmentGroups,
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
  const { halls, lofts, isLoading: isCatalogLoading, isError: isCatalogError } = useVenueCatalog()
  const { apply, isPendingFor, getErrorFor, clearErrorFor } = useUpdateManagerAssignments()

  const catalogDisabled = isCatalogLoading || isCatalogError

  const loftGroups = useMemo(() => [{ options: buildLoftAssignmentOptions(lofts) }], [lofts])

  const loftNameById = useMemo(
    () => new Map(lofts.map((item) => [item.id, item.name] as const)),
    [lofts],
  )

  // Лофты — производная от залов: бэкенд в справочнике может не отдавать loft,
  // поэтому выводим названия лофтов из закреплённых залов (как и чекбоксы).
  const managersWithLofts = useMemo(
    () =>
      allManagers.map((manager) => {
        const selectedHallIds = getSelectedHallIds(manager.assignments)
        const loftNames = deriveSelectedLoftIds(halls, selectedHallIds)
          .map((id) => loftNameById.get(id))
          .filter((name): name is string => Boolean(name))
        return { ...manager, lofts: loftNames }
      }),
    [allManagers, halls, loftNameById],
  )

  const managers = useMemo(
    () => filterManagersTable(managersWithLofts, { search, hall, loft }),
    [managersWithLofts, search, hall, loft],
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
      let targetHallIds: number[]
      if (mode === 'halls') {
        targetHallIds = selectedKeys.map(Number)
      } else {
        const currentHallIds = getSelectedHallIds(manager.assignments)
        const nextLoftIds = selectedKeys.map(Number)
        targetHallIds = applyLoftSelection(halls, currentHallIds, nextLoftIds)
      }
      const result = await apply({ manager, mode, targetHallIds })
      return result.ok ? { ok: true } : { ok: false }
    },
    [apply, halls],
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
          const selectedHallIds = getSelectedHallIds(manager.assignments)
          const selectedLoftIds = deriveSelectedLoftIds(halls, selectedHallIds)
          const hallSelectedKeys = new Set(selectedHallIds.map(String))
          const loftSelectedKeys = new Set(selectedLoftIds.map(String))
          const hallGroups = buildHallAssignmentGroups(halls, lofts, selectedLoftIds)

          return (
            <ManagersTableRow
              key={manager.id}
              manager={manager}
              hallGroups={hallGroups}
              loftGroups={loftGroups}
              hallSelectedKeys={hallSelectedKeys}
              loftSelectedKeys={loftSelectedKeys}
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
