import type { Control, FieldPath, FieldValues } from 'react-hook-form'

import { cn } from '@/shared/lib/utils'
import { ClearableSelect } from '@/shared/ui/clearable-select'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { MultiSelect } from '@/shared/ui/multi-select'
import { RequiredLabel } from '@/shared/ui/required-label'

import type { LoftHallFormValues } from '../lib/loft-hall-form-values'
import type { LoftHallAssignment } from '../model/use-loft-hall-assignment'

interface LoftHallAssignmentFieldsProps<TValues extends FieldValues & LoftHallFormValues> {
  control: Control<TValues>
  assignment: LoftHallAssignment
  triggerClassName?: string
  /** 'inline' — лофт и зал в одну строку по половине ширины. По умолчанию stacked. */
  layout?: 'stacked' | 'inline'
  /** Показывать селект зала всегда, не дожидаясь выбора лофта. */
  alwaysShowHalls?: boolean
  /** Помечать лейблы обязательными. */
  required?: boolean
  loftLabel?: string
  hallLabel?: string
}

/**
 * Поля «Лофты» и «Залы» для форм выбора площадки.
 * По умолчанию селект залов появляется только после выбора лофта; при единственном
 * лофте вместо мультиселекта показывается одиночный селект.
 */
export function LoftHallAssignmentFields<TValues extends FieldValues & LoftHallFormValues>({
  control,
  assignment,
  triggerClassName,
  layout = 'stacked',
  alwaysShowHalls = false,
  required = false,
  loftLabel = 'Лофты',
  hallLabel = 'Залы',
}: LoftHallAssignmentFieldsProps<TValues>) {
  const {
    loftOptions,
    hallOptionGroups,
    isSingleLoftSelect,
    hasHalls,
    selectDisabled,
    handleLoftsChange,
    handleHallsChange,
  } = assignment

  const loftsName = 'lofts' as FieldPath<TValues>
  const hallsName = 'halls' as FieldPath<TValues>
  const isInline = layout === 'inline'
  const showHalls = alwaysShowHalls || hasHalls

  const renderLabel = (label: string) =>
    required ? <RequiredLabel label={label} required /> : label

  const loftField = (
    <FormField
      control={control}
      name={loftsName}
      render={({ field }) => (
        <FormItem className={cn(isInline && 'min-w-0')}>
          <FormLabel>{renderLabel(loftLabel)}</FormLabel>
          <FormControl>
            {isSingleLoftSelect ? (
              <ClearableSelect
                placeholder="Выберите лофт"
                value={(field.value as string[])[0] ?? null}
                options={loftOptions}
                onChange={(v) => handleLoftsChange(v ? [v] : [])}
                triggerClassName={triggerClassName}
                disabled={selectDisabled}
              />
            ) : (
              <MultiSelect
                placeholder="Выберите лофты"
                values={field.value as string[]}
                options={loftOptions}
                onChange={handleLoftsChange}
                triggerClassName={triggerClassName}
                disabled={selectDisabled}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )

  const hallField = showHalls ? (
    <FormField
      control={control}
      name={hallsName}
      render={({ field }) => (
        <FormItem className={cn(isInline && 'min-w-0')}>
          <FormLabel>{renderLabel(hallLabel)}</FormLabel>
          <FormControl>
            <MultiSelect
              placeholder="Выберите залы"
              values={field.value as string[]}
              options={hallOptionGroups}
              onChange={handleHallsChange}
              triggerClassName={triggerClassName}
              disabled={selectDisabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  ) : null

  if (isInline) {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
        {loftField}
        {hallField}
      </div>
    )
  }

  return (
    <>
      {loftField}
      {hallField}
    </>
  )
}
