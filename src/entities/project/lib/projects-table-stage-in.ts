import type { ProjectStageEnumKey } from '@/shared/api/generated/types/Project'

import { closingStageToApi } from './closing-stage-api'
import { CLOSING_STAGE_ORDER } from './closing-stages'
import { preprojectStageToApi } from './preproject-stage-api'
import { PRE_PROJECT_STAGES } from './stages'

/** В API остаётся отдельным `stage`; на фронте мапится в `data_confirmed`. */
const FEEDBACK_RECEIVED_API_STAGE: ProjectStageEnumKey = 'feedback_received'

/**
 * Таблица «Все проекты» (обычный режим): предпроект + закрытие.
 * Исключены `out_of_mag_scope` (отдельный раздел) и `archived` (архив закрытия).
 */
export const PROJECTS_TABLE_DEFAULT_STAGE_IN = [
  ...PRE_PROJECT_STAGES.map(preprojectStageToApi),
  ...CLOSING_STAGE_ORDER.map(closingStageToApi),
  FEEDBACK_RECEIVED_API_STAGE,
].join(',')

/** Тумблер «Ожидают обработки» — подмножество этапов внутри того же списка. */
export const PROJECTS_TABLE_PENDING_STAGE_IN: ProjectStageEnumKey[] = [
  'data_confirmed',
  'bonus_approved',
]

export const PROJECTS_TABLE_PENDING_STAGE_IN_PARAM = PROJECTS_TABLE_PENDING_STAGE_IN.join(',')
