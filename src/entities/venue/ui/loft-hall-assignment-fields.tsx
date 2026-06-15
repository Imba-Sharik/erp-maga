import type { Control, FieldPath, FieldValues } from 'react-hook-form'

import { ClearableSelect } from '@/shared/ui/clearable-select'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { MultiSelect } from '@/shared/ui/multi-select'

import type { LoftHallFormValues } from '../lib/loft-hall-form-values'
import type { LoftHallAssignment } from '../model/use-loft-hall-assignment'

interface LoftHallAssignmentFieldsProps<TValues extends FieldValues & LoftHallFormValues> {
  control: Control<TValues>
  assignment: LoftHallAssignment
  triggerClassName?: string
}

/**
 * Поля «Лофты» и «Залы» для форм выбора площадки.
 * Селект залов появляется только после выбора лофта; при единственном лофте
 * вместо мультиселекта показывается одиночный селект.
 */
export function LoftHallAssignmentFields<TValues extends FieldValues & LoftHallFormValues>({
  control,
  assignment,
  triggerClassName,
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

  return (
    <>
      <FormField
        control={control}
        name={loftsName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Лофты</FormLabel>
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
      {hasHalls ? (
        <FormField
          control={control}
          name={hallsName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Залы</FormLabel>
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
      ) : null}
    </>
  )
}
