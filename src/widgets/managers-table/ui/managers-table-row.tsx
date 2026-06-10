import { type Manager, type ManagerAssignmentMode } from '@/entities/manager'
import { formatTableMoney } from '@/shared/lib/format-table-money'
import {
  formatGridTableList,
  GridTableCell,
  GridTableRow,
  GridTableRowActionCell,
} from '@/shared/ui/grid-table'

import type { ManagerAssignmentOptionGroup } from '../lib/build-assignment-options'
import { MANAGERS_TABLE_GRID_TEMPLATE } from '../lib/managers-table-columns'
import { DeleteManagerButton } from './delete-manager-button'
import { ManagerAssignmentsEditCell } from './manager-assignments-edit-cell'

interface ManagersTableRowProps {
  manager: Manager
  hallGroups: readonly ManagerAssignmentOptionGroup[]
  loftGroups: readonly ManagerAssignmentOptionGroup[]
  hallSelectedKeys: ReadonlySet<string>
  loftSelectedKeys: ReadonlySet<string>
  editing: { managerId: string; mode: ManagerAssignmentMode } | null
  catalogDisabled: boolean
  isPendingFor: (managerId: string, mode: ManagerAssignmentMode) => boolean
  getErrorFor: (managerId: string, mode: ManagerAssignmentMode) => string | null
  onClearError: (managerId: string, mode: ManagerAssignmentMode) => void
  onEditOpenChange: (managerId: string, mode: ManagerAssignmentMode, open: boolean) => void
  onApplyAssignments: (
    manager: Manager,
    mode: ManagerAssignmentMode,
    selectedKeys: string[],
  ) => Promise<{ ok: true } | { ok: false }>
  onRequestDelete: (manager: Manager) => void
}

export function ManagersTableRow({
  manager,
  hallGroups,
  loftGroups,
  hallSelectedKeys,
  loftSelectedKeys,
  editing,
  catalogDisabled,
  isPendingFor,
  getErrorFor,
  onClearError,
  onEditOpenChange,
  onApplyAssignments,
  onRequestDelete,
}: ManagersTableRowProps) {
  const loftsDisplay = formatGridTableList(manager.lofts)
  const hallsDisplay = formatGridTableList(manager.halls)
  const hasHalls = hallSelectedKeys.size > 0

  return (
    <GridTableRow gridTemplate={MANAGERS_TABLE_GRID_TEMPLATE}>
      <GridTableCell>
        <span className="w-full truncate font-medium text-[#454545]">{manager.fullName}</span>
      </GridTableCell>

      <ManagerAssignmentsEditCell
        ariaLabel="Редактировать привязки LOFT"
        displayText={loftsDisplay}
        groups={loftGroups}
        selectedKeys={loftSelectedKeys}
        isOpen={editing?.managerId === manager.id && editing.mode === 'lofts'}
        isDisabled={catalogDisabled}
        isPending={isPendingFor(manager.id, 'lofts')}
        errorMessage={getErrorFor(manager.id, 'lofts')}
        onOpenChange={(open) => onEditOpenChange(manager.id, 'lofts', open)}
        onClearError={() => onClearError(manager.id, 'lofts')}
        onApply={(keys) => onApplyAssignments(manager, 'lofts', keys)}
      />

      {hasHalls ? (
        <ManagerAssignmentsEditCell
          ariaLabel="Редактировать привязки залов"
          displayText={hallsDisplay}
          groups={hallGroups}
          selectedKeys={hallSelectedKeys}
          isOpen={editing?.managerId === manager.id && editing.mode === 'halls'}
          isDisabled={catalogDisabled}
          isPending={isPendingFor(manager.id, 'halls')}
          errorMessage={getErrorFor(manager.id, 'halls')}
          onOpenChange={(open) => onEditOpenChange(manager.id, 'halls', open)}
          onClearError={() => onClearError(manager.id, 'halls')}
          onApply={(keys) => onApplyAssignments(manager, 'halls', keys)}
        />
      ) : (
        <GridTableCell muted>{hallsDisplay}</GridTableCell>
      )}

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
