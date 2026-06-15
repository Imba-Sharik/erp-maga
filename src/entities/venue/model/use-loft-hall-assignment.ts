import { useCallback, useMemo } from 'react'
import type { FieldPath, FieldValues, PathValue, UseFormReturn } from 'react-hook-form'

import {
  keyedGroupsToMultiSelect,
  keyedOptionsToMultiSelect,
  type MultiSelectOption,
  type MultiSelectOptionGroup,
} from '@/shared/ui/multi-select'

import {
  buildFilteredHallGroups,
  buildLoftAssignmentOptions,
} from '../lib/build-assignment-options'
import type { LoftHallFormValues } from '../lib/loft-hall-form-values'
import { applyLoftSelection, syncLoftHallSelection } from '../lib/loft-hall-selection'
import { scopeVenueCatalogByHallIds } from '../lib/scope-venue-catalog-by-hall-ids'
import { useVenueCatalog } from './use-venue-catalog'

export interface UseLoftHallAssignmentOptions {
  /** Для менеджера MAG: только закреплённые залы/лофты. */
  assigned?: boolean
  /** Сузить каталог до указанных id залов (фильтр по выбранному менеджеру). */
  restrictToHallIds?: number[]
}

export interface LoftHallAssignment {
  loftOptions: MultiSelectOption[]
  hallOptionGroups: MultiSelectOptionGroup[]
  /** Единственный доступный лофт — переключает UI на одиночный селект. */
  isSingleLoftSelect: boolean
  /** Выбран хотя бы один зал — показываем селект залов. */
  hasHalls: boolean
  selectDisabled: boolean
  handleLoftsChange: (nextLoftValues: string[]) => void
  handleHallsChange: (nextHallValues: string[]) => void
}

/**
 * Логика выбора «лофт ⇄ залы» для форм (создание проекта/встречи).
 * Источник правды — поле `halls`; `lofts` выводится из выбранных залов.
 * Переключение лофта раскрывается в добавление/снятие всех его залов.
 */
export function useLoftHallAssignment<TValues extends FieldValues & LoftHallFormValues>(
  form: UseFormReturn<TValues>,
  options: UseLoftHallAssignmentOptions = {},
): LoftHallAssignment {
  const { assigned, restrictToHallIds } = options

  const loftsName = 'lofts' as FieldPath<TValues>
  const hallsName = 'halls' as FieldPath<TValues>

  const {
    halls: catalogHalls,
    lofts: catalogLofts,
    isLoading,
    isError,
  } = useVenueCatalog(assigned ? { assigned: true } : undefined)

  const { halls, lofts } = useMemo(
    () => scopeVenueCatalogByHallIds(catalogHalls, catalogLofts, restrictToHallIds),
    [catalogHalls, catalogLofts, restrictToHallIds],
  )

  const selectDisabled = isLoading || isError

  const selectedHallValues = form.watch(hallsName) as string[]

  const loftOptions = useMemo(
    () => keyedOptionsToMultiSelect(buildLoftAssignmentOptions(lofts)),
    [lofts],
  )
  const isSingleLoftSelect = lofts.length === 1
  const hasHalls = selectedHallValues.length > 0

  const hallOptionGroups = useMemo(
    () =>
      keyedGroupsToMultiSelect(
        buildFilteredHallGroups(halls, lofts, selectedHallValues.map(Number)),
      ),
    [halls, lofts, selectedHallValues],
  )

  const syncFromHalls = useCallback(
    (hallIds: number[]) => {
      const { hallIds: nextHallIds, loftIds } = syncLoftHallSelection(halls, hallIds)
      form.setValue(hallsName, nextHallIds.map(String) as PathValue<TValues, FieldPath<TValues>>, {
        shouldValidate: true,
      })
      form.setValue(loftsName, loftIds.map(String) as PathValue<TValues, FieldPath<TValues>>, {
        shouldValidate: true,
      })
    },
    [form, halls, hallsName, loftsName],
  )

  const handleHallsChange = useCallback(
    (nextHallValues: string[]) => {
      syncFromHalls(nextHallValues.map(Number))
    },
    [syncFromHalls],
  )

  const handleLoftsChange = useCallback(
    (nextLoftValues: string[]) => {
      const currentHallIds = (form.getValues(hallsName) as string[]).map(Number)
      const nextHallIds = applyLoftSelection(halls, currentHallIds, nextLoftValues.map(Number))
      syncFromHalls(nextHallIds)
    },
    [form, halls, hallsName, syncFromHalls],
  )

  return {
    loftOptions,
    hallOptionGroups,
    isSingleLoftSelect,
    hasHalls,
    selectDisabled,
    handleLoftsChange,
    handleHallsChange,
  }
}
