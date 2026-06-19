import { useCallback, useMemo, useState } from 'react'

import {
  getSelectedHallIds,
  useManagersDirectory,
  type Manager,
  type ManagerAssignmentMode,
} from '@/entities/manager'
import {
  applyLoftToggles,
  buildFilteredHallGroups,
  buildLoftAssignmentOptions,
  deriveSelectedLoftIds,
  getHallIdsForLoft,
  useVenueCatalog,
} from '@/entities/venue'
import { ConfirmDeleteManagerDialog } from '@/features/confirm-delete-manager'
import { useUpdateManagerAssignments } from '@/features/update-manager-assignments'
import {
  GridTableHeaderCell,
  GridTableHeaderLabel,
  GridTableView,
  GridTableViewport,
} from '@/shared/ui/grid-table'

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
      touchedKeys: string[],
    ): Promise<{ ok: true } | { ok: false }> => {
      let targetHallIds: number[]
      if (mode === 'halls') {
        targetHallIds = selectedKeys.map(Number)
      } else {
        // tri-state лофтов: применяем только реально тронутые лофты, чтобы не
        // снести частичный выбор при открытии/закрытии селекта без изменений.
        const currentHallIds = getSelectedHallIds(manager.assignments)
        const draftLoftIds = new Set(selectedKeys.map(Number))
        const touchedLoftIds = touchedKeys.map(Number)
        const fullLoftIds = touchedLoftIds.filter((id) => draftLoftIds.has(id))
        const clearedLoftIds = touchedLoftIds.filter((id) => !draftLoftIds.has(id))
        targetHallIds = applyLoftToggles(halls, currentHallIds, fullLoftIds, clearedLoftIds)
      }
      const result = await apply({ manager, mode, targetHallIds })
      return result.ok ? { ok: true } : { ok: false }
    },
    [apply, halls],
  )

  const emptyMessage = isError ? 'Не удалось загрузить список менеджеров.' : 'Менеджеры не найдены.'

  return (
    <>
      <GridTableViewport>
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
            const selectedHallIdSet = new Set(selectedHallIds)
            const selectedLoftIds = deriveSelectedLoftIds(halls, selectedHallIds)

            // Полностью выбранный лофт (все его залы) → галочка; частично → indeterminate.
            const loftSelectedKeys = new Set<string>()
            const loftIndeterminateKeys = new Set<string>()
            for (const loftId of selectedLoftIds) {
              const loftHallIds = getHallIdsForLoft(halls, loftId)
              const isFull =
                loftHallIds.length > 0 && loftHallIds.every((id) => selectedHallIdSet.has(id))
              ;(isFull ? loftSelectedKeys : loftIndeterminateKeys).add(String(loftId))
            }

            const hallSelectedKeys = new Set(selectedHallIds.map(String))
            // Имена для залов вне каталога (сирот) — берём из назначений менеджера.
            const assignmentHallNames = new Map(
              manager.assignments.map((a) => [a.hallId, a.hallName] as const),
            )
            const hallGroups = buildFilteredHallGroups(
              halls,
              lofts,
              selectedHallIds,
              assignmentHallNames,
            )

            return (
              <ManagersTableRow
                key={manager.id}
                manager={manager}
                hallGroups={hallGroups}
                loftGroups={loftGroups}
                hallSelectedKeys={hallSelectedKeys}
                loftSelectedKeys={loftSelectedKeys}
                loftIndeterminateKeys={loftIndeterminateKeys}
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
      </GridTableViewport>

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
