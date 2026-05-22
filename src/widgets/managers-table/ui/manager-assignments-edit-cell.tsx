import { useEffect, useState } from 'react'

import { PenIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { GridTableCell } from '@/shared/ui/grid-table'

import type { ManagerAssignmentOption } from '../lib/build-assignment-options'

function stopRowNavigation(e: React.MouseEvent | React.PointerEvent) {
  e.stopPropagation()
}

export interface ManagerAssignmentsEditCellProps {
  ariaLabel: string
  displayText: string
  options: readonly ManagerAssignmentOption[]
  selectedKeys: ReadonlySet<string>
  isOpen: boolean
  isDisabled?: boolean
  isPending?: boolean
  onOpenChange: (open: boolean) => void
  onApply: (selectedKeys: string[]) => void
}

export function ManagerAssignmentsEditCell({
  ariaLabel,
  displayText,
  options,
  selectedKeys,
  isOpen,
  isDisabled = false,
  isPending = false,
  onOpenChange,
  onApply,
}: ManagerAssignmentsEditCellProps) {
  const [draft, setDraft] = useState<Set<string>>(() => new Set(selectedKeys))

  useEffect(() => {
    if (isOpen) setDraft(new Set(selectedKeys))
  }, [isOpen, selectedKeys])

  const handleApply = () => {
    onApply([...draft])
    onOpenChange(false)
  }

  return (
    <div className="min-w-0" onClick={stopRowNavigation} onPointerDown={stopRowNavigation}>
      <GridTableCell muted>
        <span className="flex w-full min-w-0 items-center gap-1.5">
          <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="shrink-0 cursor-pointer text-[#BCBCBC] hover:text-[#454545] data-[state=open]:text-[#454545]"
                aria-label={ariaLabel}
                disabled={isDisabled || isPending}
                onClick={stopRowNavigation}
              >
                <PenIcon className="size-3 shrink-0 [&_path]:fill-current" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-h-72 min-w-56 p-0"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <div className="max-h-52 overflow-y-auto p-1">
                {options.length === 0 ? (
                  <p className="px-2 py-1.5 text-sm text-[#ACACAC]">Нет данных</p>
                ) : (
                  options.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.key}
                      checked={draft.has(option.key)}
                      disabled={isPending}
                      onCheckedChange={(checked) => {
                        setDraft((prev) => {
                          const next = new Set(prev)
                          if (checked === true) next.add(option.key)
                          else next.delete(option.key)
                          return next
                        })
                      }}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <span className="min-w-0 truncate">{option.label}</span>
                    </DropdownMenuCheckboxItem>
                  ))
                )}
              </div>
              {options.length > 0 ? (
                <>
                  <DropdownMenuSeparator />
                  <div className="p-1.5">
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 w-full rounded-[8px]"
                      disabled={isPending}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleApply()
                      }}
                    >
                      {isPending ? 'Сохранение…' : 'Готово'}
                    </Button>
                  </div>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
          <span
            className={cn('min-w-0 truncate text-[#ACACAC]', isOpen && 'text-[#454545]')}
            title={displayText}
          >
            {displayText}
          </span>
        </span>
      </GridTableCell>
    </div>
  )
}
