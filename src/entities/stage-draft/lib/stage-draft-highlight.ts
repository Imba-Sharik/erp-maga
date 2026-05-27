import { cn } from '@/shared/lib/utils'

/** Обводка незавершённого черновика — канбан и блок этапа на детальной странице. */
export const STAGE_DRAFT_HIGHLIGHT_CLASS = 'border-draft-highlight ring-1 ring-draft-highlight'

export function stageBlockBorderClass(hasDraftHighlight?: boolean): string {
  return hasDraftHighlight ? STAGE_DRAFT_HIGHLIGHT_CLASS : 'border-[#B1B1B1]'
}

export function stageCardBorderClass(
  hasDraft?: boolean,
  defaultBorder = 'border-[#D3D3D3]',
): string {
  return cn(hasDraft ? `${STAGE_DRAFT_HIGHLIGHT_CLASS} bg-draft-highlight/10` : defaultBorder)
}
