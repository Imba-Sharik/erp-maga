/** Подсказка, когда в матрице нет менеджеров, закреплённых за залом проекта. */
export const MANAGER_HALL_ASSIGNMENT_HINT =
  'На залы этого проекта не назначено ни одного менеджера. Закрепите залы на странице "Менеджеры"'

export function hasAssignableManagerOptions(options: readonly { id: string }[]): boolean {
  return options.some((option) => !option.id.startsWith('name:'))
}

/** Пока идёт загрузка отфильтрованного списка — не показываем подсказку и пункты. */
export function isManagersDirectoryOptionsLoading(params: {
  filtered: boolean
  isFetched: boolean
  isFetching: boolean
}): boolean {
  if (!params.filtered) return false
  return params.isFetching || !params.isFetched
}

/** Подсказка только после успешного ответа с пустым списком назначаемых менеджеров. */
export function shouldShowManagerHallAssignmentHint(params: {
  filtered: boolean
  isFetched: boolean
  isFetching: boolean
  isError: boolean
  options: readonly { id: string }[]
}): boolean {
  if (!params.filtered) return false
  if (params.isError || params.isFetching || !params.isFetched) return false
  return !hasAssignableManagerOptions(params.options)
}
