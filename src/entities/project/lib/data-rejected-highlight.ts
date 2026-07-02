/**
 * Подсветка проекта с непринятыми данными (`data_rejected`, ERP-221): руководитель
 * не принял данные на этапе «Данные подтверждены» — системная пауза, менеджер должен
 * сразу увидеть проект в списках и карточке. Формы классов зеркалят подсветку
 * черновиков (`entities/stage-draft/lib/stage-draft-highlight.ts`), но в error-токенах.
 */
export const DATA_REJECTED_HIGHLIGHT_CLASS = 'border-error ring-1 ring-error'

/** Красная обводка канбан-карточки и блока этапа. */
export function dataRejectedCardClass(dataRejected?: boolean): string | null {
  return dataRejected ? `${DATA_REJECTED_HIGHLIGHT_CLASS} bg-error-surface` : null
}

/** Красная подсветка строки таблицы (перебивает hover, как у черновиков). */
export function dataRejectedRowClass(dataRejected?: boolean): string {
  return dataRejected
    ? 'bg-error-surface hover:bg-error-surface-hover shadow-[inset_3px_0_0_0_var(--error)]'
    : ''
}
