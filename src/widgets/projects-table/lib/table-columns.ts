import type { ProjectsTableColumnView } from './economics-columns'

/** Шаблон колонок «Общие данные» — общий для шапки и строк. */
export const TABLE_GRID_TEMPLATE_GENERAL =
  'minmax(170px,1.5fr) minmax(96px,0.8fr) minmax(96px,0.8fr) minmax(170px,1.45fr) minmax(150px,1.2fr) minmax(120px,1fr) minmax(120px,1fr) minmax(130px,1.05fr) minmax(140px,1.15fr)'

/** Шаблон колонок «Данные экономики». */
export const TABLE_GRID_TEMPLATE_ECONOMICS =
  'minmax(170px,1.5fr) minmax(170px,1.45fr) minmax(120px,1fr) minmax(150px,1.2fr) minmax(130px,1.05fr) minmax(130px,1.05fr) minmax(130px,1.05fr)'

/** Шаблон колонок «Вне контура MAG». */
export const TABLE_GRID_TEMPLATE_OUTSIDE_MAG =
  'minmax(170px,1.5fr) minmax(96px,0.8fr) minmax(96px,0.8fr) minmax(170px,1.45fr) minmax(165px,1.35fr) minmax(120px,1fr) minmax(120px,1fr) minmax(140px,1.1fr) minmax(140px,1.1fr) minmax(56px,72px)'

export const TABLE_MIN_WIDTH_GENERAL = '1180px'
export const TABLE_MIN_WIDTH_ECONOMICS = '900px'
export const TABLE_MIN_WIDTH_OUTSIDE_MAG = '1315px'

export const TABLE_COLUMN_COUNT: Record<ProjectsTableColumnView, number> = {
  general: 9,
  economics: 7,
  'outside-mag': 10,
}

export function getTableGridTemplate(view: ProjectsTableColumnView): string {
  if (view === 'economics') return TABLE_GRID_TEMPLATE_ECONOMICS
  if (view === 'outside-mag') return TABLE_GRID_TEMPLATE_OUTSIDE_MAG
  return TABLE_GRID_TEMPLATE_GENERAL
}

export function getTableMinWidth(view: ProjectsTableColumnView): string {
  if (view === 'economics') return TABLE_MIN_WIDTH_ECONOMICS
  if (view === 'outside-mag') return TABLE_MIN_WIDTH_OUTSIDE_MAG
  return TABLE_MIN_WIDTH_GENERAL
}
