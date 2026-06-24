import { ChevronDownIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './dropdown-menu'

export type MultiSelectOption = {
  value: string
  label: string
  /** Заблокированная опция: чекбокс недоступен, лейбл приглушён. */
  disabled?: boolean
}

export type MultiSelectOptionGroup = {
  /** Подзаголовок группы. Если не задан — рендерится без заголовка. */
  label?: string
  options: MultiSelectOption[]
}

type KeyedOption = { key: string; label: string }
type KeyedOptionGroup = { label?: string; options: readonly KeyedOption[] }

/** Адаптер опций с `key` (venue, managers-table) → `value` (MultiSelect). */
export function keyedOptionsToMultiSelect(options: readonly KeyedOption[]): MultiSelectOption[] {
  return options.map((option) => ({ value: option.key, label: option.label }))
}

export function keyedGroupsToMultiSelect(
  groups: readonly KeyedOptionGroup[],
): MultiSelectOptionGroup[] {
  return groups.map((group) => ({
    label: group.label,
    options: keyedOptionsToMultiSelect(group.options),
  }))
}

type MultiSelectOptions = readonly string[] | readonly MultiSelectOption[]
type MultiSelectItems = MultiSelectOptions | readonly MultiSelectOptionGroup[]

function isGroupedOptions(items: MultiSelectItems): items is readonly MultiSelectOptionGroup[] {
  return items.length > 0 && typeof items[0] === 'object' && 'options' in items[0]
}

function normalizeOptions(options: MultiSelectOptions): MultiSelectOption[] {
  if (options.length === 0) return []
  if (typeof options[0] === 'string') {
    return (options as readonly string[]).map((value) => ({ value, label: value }))
  }
  return [...(options as readonly MultiSelectOption[])]
}

function flattenOptions(items: MultiSelectItems): MultiSelectOption[] {
  if (isGroupedOptions(items)) {
    return items.flatMap((group) => group.options)
  }
  return normalizeOptions(items)
}

interface MultiSelectProps {
  values: string[]
  onChange: (values: string[]) => void
  options: MultiSelectItems
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
  const flatOptions = flattenOptions(options)
  const grouped = isGroupedOptions(options)
  const selectedLabels = flatOptions.filter((o) => values.includes(o.value)).map((o) => o.label)
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
          'border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full min-w-0 items-center justify-between gap-2 overflow-hidden rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
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
        {flatOptions.length === 0 ? (
          <p className="px-2 py-1.5 text-sm text-[#ACACAC]">Нет данных</p>
        ) : grouped ? (
          (options as readonly MultiSelectOptionGroup[]).map((group, groupIndex) => (
            <div key={group.label ?? groupIndex}>
              {group.label ? (
                <DropdownMenuLabel className="px-2 py-1 text-xs text-[#ACACAC]">
                  {group.label}
                </DropdownMenuLabel>
              ) : null}
              {group.options.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={values.includes(option.value)}
                  disabled={option.disabled}
                  onCheckedChange={(checked) => toggle(option.value, checked === true)}
                  onSelect={(e) => e.preventDefault()}
                >
                  <span className="min-w-0 truncate">{option.label}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          ))
        ) : (
          flatOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={values.includes(option.value)}
              disabled={option.disabled}
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
