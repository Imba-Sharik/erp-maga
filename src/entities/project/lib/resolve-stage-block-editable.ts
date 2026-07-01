import type { ProjectDetail, ProjectStage } from '../model/types'

/** Какие per-block флаги бэка нужны, чтобы решить редактируемость блока этапа. */
type BlockEditFlags = Pick<
  ProjectDetail,
  | 'canEditClient'
  | 'canEditContract'
  | 'canEditSales'
  | 'canEditExpenses'
  | 'canEditPrimaryContact'
  | 'canEditCalculation'
>

/**
 * Можно ли РЕДАКТИРОВАТЬ блок этапа прямо сейчас — по серверным per-block флагам
 * (`can_edit_*`, единый источник правды: роль, стадия, владелец, archived/out_of_mag,
 * `event_date` уже учтены на бэке). Секция этапа отображается на свой блок:
 *
 * - `plum_request`       → клиент (mag_comment)
 * - `primary_contact_done`→ первичный контакт (канал + комментарий)
 * - `calculation_prepared`→ расчёт (комментарий)
 * - `contract_signed`    → договор
 * - `ready_to_event`     → продажи
 * - `expenses_entered`   → расходы
 *
 * Этапы без block-ручки (нет PATCH-маршрута) → `undefined`: правка задним числом для
 * них не предусмотрена (синхронно с {@link isStagePatchable}).
 */
export function resolveStageBlockEditable(
  project: BlockEditFlags,
  stage: ProjectStage,
): boolean | undefined {
  switch (stage) {
    case 'plum_request':
      return project.canEditClient
    case 'primary_contact_done':
      return project.canEditPrimaryContact
    case 'calculation_prepared':
      return project.canEditCalculation
    case 'contract_signed':
      return project.canEditContract
    case 'ready_to_event':
      return project.canEditSales
    case 'expenses_entered':
      return project.canEditExpenses
    default:
      return undefined
  }
}
