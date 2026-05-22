import { useMemo } from 'react'

import {
  getSelectedAssignmentKeys,
  type Manager,
  type ManagerAssignmentMode,
} from '@/entities/manager'
import { formatTableMoney } from '@/shared/lib/format-table-money'
import {
  formatGridTableList,
  GridTableCell,
  GridTableRow,
  GridTableRowActionCell,
} from '@/shared/ui/grid-table'

import type { ManagerAssignmentOption } from '../lib/build-assignment-options'
import { MANAGERS_TABLE_GRID_TEMPLATE } from '../lib/managers-table-columns'
import { DeleteManagerButton } from './delete-manager-button'
import { ManagerAssignmentsEditCell } from './manager-assignments-edit-cell'

interface ManagersTableRowProps {
  manager: Manager
  hallOptions: readonly ManagerAssignmentOption[]
  loftOptions: readonly ManagerAssignmentOption[]
  editing: { managerId: string; mode: ManagerAssignmentMode } | null
  catalogDisabled: boolean
  isPendingFor: (managerId: string, mode: ManagerAssignmentMode) => boolean
  onEditOpenChange: (managerId: string, mode: ManagerAssignmentMode, open: boolean) => void
  onApplyAssignments: (
    manager: Manager,
    mode: ManagerAssignmentMode,
    selectedKeys: string[],
  ) => void
  onRequestDelete: (manager: Manager) => void
}

export function ManagersTableRow({
  manager,
  hallOptions,
  loftOptions,
  editing,
  catalogDisabled,
  isPendingFor,
  onEditOpenChange,
  onApplyAssignments,
  onRequestDelete,
}: ManagersTableRowProps) {
  const loftKeys = useMemo(
    () => getSelectedAssignmentKeys(manager.assignments, 'lofts'),
    [manager.assignments],
  )
  const hallKeys = useMemo(
    () => getSelectedAssignmentKeys(manager.assignments, 'halls'),
    [manager.assignments],
  )

  const loftsDisplay = formatGridTableList(manager.lofts)
  const hallsDisplay = formatGridTableList(manager.halls)

  return (
    <GridTableRow gridTemplate={MANAGERS_TABLE_GRID_TEMPLATE}>
      <GridTableCell>
        <span className="w-full truncate font-medium text-[#454545]">{manager.fullName}</span>
      </GridTableCell>

      <ManagerAssignmentsEditCell
        ariaLabel="Редактировать привязки LOFT"
        displayText={loftsDisplay}
        options={loftOptions}
        selectedKeys={loftKeys}
        isOpen={editing?.managerId === manager.id && editing.mode === 'lofts'}
        isDisabled={catalogDisabled}
        isPending={isPendingFor(manager.id, 'lofts')}
        onOpenChange={(open) => onEditOpenChange(manager.id, 'lofts', open)}
        onApply={(keys) => onApplyAssignments(manager, 'lofts', keys)}
      />

      <ManagerAssignmentsEditCell
        ariaLabel="Редактировать привязки залов"
        displayText={hallsDisplay}
        options={hallOptions}
        selectedKeys={hallKeys}
        isOpen={editing?.managerId === manager.id && editing.mode === 'halls'}
        isDisabled={catalogDisabled}
        isPending={isPendingFor(manager.id, 'halls')}
        onOpenChange={(open) => onEditOpenChange(manager.id, 'halls', open)}
        onApply={(keys) => onApplyAssignments(manager, 'halls', keys)}
      />

      <GridTableCell muted>{String(manager.activeProjectsCount)}</GridTableCell>
      <GridTableCell muted>{String(manager.closedProjectsCount)}</GridTableCell>
      <GridTableCell muted>{formatTableMoney(manager.salesTotal)}</GridTableCell>
      <GridTableCell muted>{formatTableMoney(manager.bonusTotal)}</GridTableCell>
      <GridTableRowActionCell>
        <DeleteManagerButton onRequestDelete={() => onRequestDelete(manager)} />
      </GridTableRowActionCell>
    </GridTableRow>
  )
}
