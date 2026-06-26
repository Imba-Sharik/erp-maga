import { cn } from '@/shared/lib/utils'

/** Обводка незавершённого черновика — канбан и блок этапа на детальной странице. */
export const STAGE_DRAFT_HIGHLIGHT_CLASS = 'border-draft-highlight ring-1 ring-draft-highlight'

export function stageBlockBorderClass(hasDraftHighlight?: boolean): string {
  return hasDraftHighlight ? STAGE_DRAFT_HIGHLIGHT_CLASS : 'border-border-strong'
}

export function stageCardBorderClass(
  hasDraft?: boolean,
  defaultBorder = 'border-border-medium',
): string {
  return cn(hasDraft ? `${STAGE_DRAFT_HIGHLIGHT_CLASS} bg-draft-highlight/10` : defaultBorder)
}

/** Жёлтая подсветка строки таблицы с незавершённым черновиком (перебивает hover). */
export function stageRowHighlightClass(hasDraft?: boolean): string {
  return hasDraft
    ? 'bg-draft-highlight/20 hover:bg-draft-highlight/30 shadow-[inset_3px_0_0_0_var(--draft-highlight)]'
    : ''
}
