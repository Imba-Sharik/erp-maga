import type { ProjectsTableColumnView } from './economics-columns'

/** Шаблон колонок «Общие данные» — общий для шапки и строк. */
export const TABLE_GRID_TEMPLATE_GENERAL =
  'minmax(170px,1.5fr) minmax(96px,0.8fr) minmax(96px,0.8fr) minmax(170px,1.45fr) minmax(150px,1.2fr) minmax(120px,1fr) minmax(120px,1fr) minmax(130px,1.05fr) minmax(140px,1.15fr)'
export const TABLE_GRID_TEMPLATE_GENERAL_WITH_ACTIONS = `${TABLE_GRID_TEMPLATE_GENERAL} minmax(56px,72px)`

/** Шаблон колонок «Данные экономики». */
export const TABLE_GRID_TEMPLATE_ECONOMICS =
  'minmax(170px,1.5fr) minmax(170px,1.45fr) minmax(120px,1fr) minmax(150px,1.2fr) minmax(130px,1.05fr) minmax(130px,1.05fr) minmax(130px,1.05fr)'
export const TABLE_GRID_TEMPLATE_ECONOMICS_WITH_ACTIONS = `${TABLE_GRID_TEMPLATE_ECONOMICS} minmax(56px,72px)`

/** Шаблон колонок «Вне контура MAG». */
export const TABLE_GRID_TEMPLATE_OUTSIDE_MAG =
  'minmax(170px,1.5fr) minmax(96px,0.8fr) minmax(96px,0.8fr) minmax(170px,1.45fr) minmax(165px,1.35fr) minmax(120px,1fr) minmax(120px,1fr) minmax(140px,1.1fr) minmax(140px,1.1fr) minmax(56px,72px)'

/**
 * Архив закрытия — «Общие данные»:
 * Название · Лофт · Зал · Менеджер · Дата мероп. · Компания · Телефон · Дата архивации
 */
export const TABLE_GRID_TEMPLATE_CLOSING_GENERAL =
  'minmax(170px,1.5fr) minmax(96px,0.8fr) minmax(96px,0.8fr) minmax(170px,1.45fr) minmax(130px,1.05fr) minmax(120px,1fr) minmax(130px,1.05fr) minmax(140px,1.15fr)'

/**
 * Архив закрытия — «Данные экономики»:
 * Название · Менеджер · Компания · Сумма продаж · Чистая прибыль · Итоговый бонус
 */
export const TABLE_GRID_TEMPLATE_CLOSING_ECONOMICS =
  'minmax(170px,1.5fr) minmax(170px,1.45fr) minmax(120px,1fr) minmax(130px,1.05fr) minmax(130px,1.05fr) minmax(130px,1.05fr)'

/**
 * Запросы бухгалтера — «Общие данные»:
 * Название · LOFT · Зал · Менеджер · Дата мероп. · Компания · Появление в системе
 */
export const TABLE_GRID_TEMPLATE_REQUESTS =
  'minmax(170px,1.5fr) minmax(96px,0.8fr) minmax(96px,0.8fr) minmax(170px,1.45fr) minmax(120px,1fr) minmax(120px,1fr) minmax(140px,1.15fr)'

/**
 * Закрытые запросы бухгалтера:
 * Название · LOFT · Зал · Менеджер · Дата мероп. · Компания · Дата подтверждения · Появление
 */
export const TABLE_GRID_TEMPLATE_CLOSED_REQUESTS =
  'minmax(170px,1.5fr) minmax(96px,0.8fr) minmax(96px,0.8fr) minmax(170px,1.45fr) minmax(120px,1fr) minmax(120px,1fr) minmax(150px,1.3fr) minmax(140px,1.15fr)'

export const TABLE_MIN_WIDTH_GENERAL = '1180px'
export const TABLE_MIN_WIDTH_GENERAL_WITH_ACTIONS = '1250px'
export const TABLE_MIN_WIDTH_ECONOMICS = '900px'
export const TABLE_MIN_WIDTH_ECONOMICS_WITH_ACTIONS = '970px'
export const TABLE_MIN_WIDTH_OUTSIDE_MAG = '1315px'
export const TABLE_MIN_WIDTH_CLOSING_GENERAL = '1050px'
export const TABLE_MIN_WIDTH_CLOSING_ECONOMICS = '850px'
export const TABLE_MIN_WIDTH_REQUESTS = '950px'
export const TABLE_MIN_WIDTH_CLOSED_REQUESTS = '1100px'

export const TABLE_COLUMN_COUNT: Record<ProjectsTableColumnView, number> = {
  general: 9,
  economics: 7,
  'outside-mag': 10,
  'closing-general': 8,
  'closing-economics': 6,
  requests: 7,
  'closed-requests': 8,
}

export function getTableGridTemplate(
  view: ProjectsTableColumnView,
  options: { withActions?: boolean } = {},
): string {
  const { withActions = false } = options
  if (view === 'economics') {
    return withActions ? TABLE_GRID_TEMPLATE_ECONOMICS_WITH_ACTIONS : TABLE_GRID_TEMPLATE_ECONOMICS
  }
  if (view === 'outside-mag') return TABLE_GRID_TEMPLATE_OUTSIDE_MAG
  if (view === 'closing-general') return TABLE_GRID_TEMPLATE_CLOSING_GENERAL
  if (view === 'closing-economics') return TABLE_GRID_TEMPLATE_CLOSING_ECONOMICS
  if (view === 'requests') return TABLE_GRID_TEMPLATE_REQUESTS
  if (view === 'closed-requests') return TABLE_GRID_TEMPLATE_CLOSED_REQUESTS
  return withActions ? TABLE_GRID_TEMPLATE_GENERAL_WITH_ACTIONS : TABLE_GRID_TEMPLATE_GENERAL
}

export function getTableMinWidth(
  view: ProjectsTableColumnView,
  options: { withActions?: boolean } = {},
): string {
  const { withActions = false } = options
  if (view === 'economics') {
    return withActions ? TABLE_MIN_WIDTH_ECONOMICS_WITH_ACTIONS : TABLE_MIN_WIDTH_ECONOMICS
  }
  if (view === 'outside-mag') return TABLE_MIN_WIDTH_OUTSIDE_MAG
  if (view === 'closing-general') return TABLE_MIN_WIDTH_CLOSING_GENERAL
  if (view === 'closing-economics') return TABLE_MIN_WIDTH_CLOSING_ECONOMICS
  if (view === 'requests') return TABLE_MIN_WIDTH_REQUESTS
  if (view === 'closed-requests') return TABLE_MIN_WIDTH_CLOSED_REQUESTS
  return withActions ? TABLE_MIN_WIDTH_GENERAL_WITH_ACTIONS : TABLE_MIN_WIDTH_GENERAL
}
