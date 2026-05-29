import { ChevronDownIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu'

export type MultiSelectOption = {
  value: string
  label: string
}

type MultiSelectOptions = readonly string[] | readonly MultiSelectOption[]

function normalizeOptions(options: MultiSelectOptions): MultiSelectOption[] {
  if (options.length === 0) return []
  if (typeof options[0] === 'string') {
    return (options as readonly string[]).map((value) => ({ value, label: value }))
  }
  return [...(options as readonly MultiSelectOption[])]
}

interface MultiSelectProps {
  values: string[]
  onChange: (values: string[]) => void
  options: MultiSelectOptions
  placeholder: string
  triggerClassName?: string
  disabled?: boolean
}

/**
 * Мультиселект поверх shadcn DropdownMenu + checkbox-итемов.
 * Триггер визуально повторяет ClearableSelect; выбор применяется мгновенно.
 */
export function MultiSelect({
  values,
  onChange,
  options,
  placeholder,
  triggerClassName,
  disabled = false,
}: MultiSelectProps) {
  const normalized = normalizeOptions(options)
  const selectedLabels = normalized.filter((o) => values.includes(o.value)).map((o) => o.label)
  const hasSelection = selectedLabels.length > 0

  const toggle = (value: string, checked: boolean) => {
    if (checked) onChange([...values, value])
    else onChange(values.filter((v) => v !== value))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        disabled={disabled}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
          triggerClassName,
        )}
      >
        {hasSelection ? (
          <span className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
            <span className="min-w-0 truncate">{selectedLabels[0]}</span>
            {selectedLabels.length > 1 ? (
              <span className="shrink-0 rounded-full bg-[#E9E6DD] px-1.5 py-0.5 text-xs leading-none text-[#6B6B6B]">
                +{selectedLabels.length - 1}
              </span>
            ) : null}
          </span>
        ) : (
          <span className="min-w-0 flex-1 truncate text-left text-[#BCBCBC]">{placeholder}</span>
        )}
        <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-72 w-(--radix-dropdown-menu-trigger-width) min-w-56 p-1"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {normalized.length === 0 ? (
          <p className="px-2 py-1.5 text-sm text-[#ACACAC]">Нет данных</p>
        ) : (
          normalized.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={values.includes(option.value)}
              onCheckedChange={(checked) => toggle(option.value, checked === true)}
              onSelect={(e) => e.preventDefault()}
            >
              <span className="min-w-0 truncate">{option.label}</span>
            </DropdownMenuCheckboxItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
