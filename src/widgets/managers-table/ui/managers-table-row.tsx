import type { Manager } from '@/entities/manager'
import { formatTableMoney } from '@/shared/lib/format-table-money'
import {
  formatGridTableList,
  GridTableCell,
  GridTableRow,
  GridTableRowActionCell,
} from '@/shared/ui/grid-table'

import { MANAGERS_TABLE_GRID_TEMPLATE } from '../lib/managers-table-columns'
import { DeleteManagerButton } from './delete-manager-button'

interface ManagersTableRowProps {
  manager: Manager
  onRequestDelete: (manager: Manager) => void
}

export function ManagersTableRow({ manager, onRequestDelete }: ManagersTableRowProps) {
  return (
    <GridTableRow gridTemplate={MANAGERS_TABLE_GRID_TEMPLATE}>
      <GridTableCell>
        <span className="w-full truncate font-medium text-[#454545]">{manager.fullName}</span>
      </GridTableCell>
      <GridTableCell muted>{formatGridTableList(manager.lofts)}</GridTableCell>
      <GridTableCell muted>{formatGridTableList(manager.halls)}</GridTableCell>
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
