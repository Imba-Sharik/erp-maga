import { ALL_STAGE_LABELS, type ProjectStage } from '@/entities/project'

interface StageActionContext {
  /** Имя менеджера проекта — для фраз вроде «утвердил бонус менеджера ...». */
  managerName?: string
}

/**
 * Формирует фразу действия для перехода НА `stage`. Возвращает `null`, если
 * этап не должен показываться в логе (системные/архивные).
 */
export function buildStageActionMessage(
  stage: ProjectStage,
  ctx: StageActionContext = {},
): string | null {
  switch (stage) {
    case 'plum_request':
    case 'out_of_mag_scope':
    case 'archived':
      return null

    case 'documents_confirmed':
      return 'подтвердил закрывающие документы по проекту'
    case 'data_confirmed':
      return 'подтвердил данные по проекту'
    case 'bonus_approved':
      return ctx.managerName
        ? `утвердил бонус менеджера ${ctx.managerName}`
        : 'утвердил бонус менеджера'
    case 'closed':
      return 'закрыл проект'

    default: {
      const label = ALL_STAGE_LABELS[stage]
      return label ? `перевёл статус в «${label}»` : null
    }
  }
}
