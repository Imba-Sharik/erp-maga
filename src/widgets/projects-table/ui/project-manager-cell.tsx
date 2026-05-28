import { useMemo } from 'react'
import { CheckIcon } from 'lucide-react'

import { PenIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

import { GridTableCell } from '@/shared/ui/grid-table'

import { buildManagerSelectOptions, type ManagerSelectOption } from '@/entities/manager'
import { TABLE_EMPTY } from './table-row-cells'

export interface ProjectManagerCellProps {
  manager: string
  directoryOptions: ManagerSelectOption[]
  isEditing: boolean
  onStartEdit: () => void
  onAssign: (managerId: string) => void
  onCancelEdit: () => void
  assignDisabled?: boolean
  editable?: boolean
}

function stopRowNavigation(e: React.MouseEvent | React.PointerEvent) {
  e.stopPropagation()
}

export function ProjectManagerCell({
  manager,
  directoryOptions,
  isEditing,
  onStartEdit,
  onAssign,
  onCancelEdit,
  assignDisabled = false,
  editable = true,
}: ProjectManagerCellProps) {
  const selectOptions = useMemo(
    () => buildManagerSelectOptions(directoryOptions, manager),
    [directoryOptions, manager],
  )
  const displayName = manager || TABLE_EMPTY

  const handleOpenChange = (open: boolean) => {
    if (open) onStartEdit()
    else onCancelEdit()
  }

  return (
    <div className="min-w-0" onClick={stopRowNavigation} onPointerDown={stopRowNavigation}>
      <GridTableCell>
        <span className="flex w-full min-w-0 items-center gap-1.5">
          {editable && (
            <DropdownMenu open={isEditing} onOpenChange={handleOpenChange}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0 cursor-pointer text-[#BCBCBC] hover:text-[#454545] data-[state=open]:text-[#454545]"
                  aria-label="Сменить ответственного менеджера"
                  onClick={stopRowNavigation}
                  disabled={assignDisabled}
                >
                  <PenIcon className="size-3 shrink-0 [&_path]:fill-current" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-60 min-w-48">
                {selectOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    className="justify-between gap-2"
                    disabled={assignDisabled || option.id.startsWith('name:')}
                    onClick={(e) => {
                      e.stopPropagation()
                      onAssign(option.id)
                    }}
                  >
                    <span className="min-w-0 truncate">{option.fullName}</span>
                    {option.fullName === manager && (
                      <CheckIcon className="size-3.5 shrink-0 text-[#454545]" aria-hidden />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <span
            className={cn('min-w-0 truncate text-[#ACACAC]', isEditing && 'text-[#454545]')}
            title={displayName}
          >
            {displayName}
          </span>
        </span>
      </GridTableCell>
    </div>
  )
}
