import type { ReactNode } from 'react'

import type { ArticleKind } from '@/entities/project-article'
import { cn } from '@/shared/lib/utils'

const GRID_ROW = [
  '@[640px]:row-start-1',
  '@[640px]:row-start-2',
  '@[640px]:row-start-3',
  '@[640px]:row-start-4',
] as const

const MOBILE_SUMMARY_SEPARATOR =
  'border-t border-surface-divider pt-4 mt-1 @[640px]:border-0 @[640px]:pt-0 @[640px]:mt-0'

function summaryCellClass(rowIndex: number, withSeparator: boolean) {
  return cn(
    'min-w-0',
    '@[640px]:col-start-3',
    GRID_ROW[rowIndex],
    withSeparator && MOBILE_SUMMARY_SEPARATOR,
  )
}

interface FinanceArticlesGridProps {
  idPrefix: string
  left: ArticleKind[]
  right: ArticleKind[]
  renderArticle: (kind: ArticleKind) => ReactNode
  /** Слоты 3-й колонки; `null` пропускается, индекс задаёт строку на десктопе. */
  summary: (ReactNode | null)[]
}

export function FinanceArticlesGrid({
  idPrefix,
  left,
  right,
  renderArticle,
  summary,
}: FinanceArticlesGridProps) {
  return (
    <div className="grid grid-cols-1 items-start gap-x-5 gap-y-4 @[640px]:grid-cols-3">
      {left.map((kind, i) => (
        <div
          key={`${idPrefix}-L-${kind}`}
          className={cn('min-w-0', '@[640px]:col-start-1', GRID_ROW[i])}
        >
          {renderArticle(kind)}
        </div>
      ))}
      {right.map((kind, i) => (
        <div
          key={`${idPrefix}-R-${kind}`}
          className={cn('min-w-0', '@[640px]:col-start-2', GRID_ROW[i])}
        >
          {renderArticle(kind)}
        </div>
      ))}
      {summary.map((slot, i) =>
        slot != null ? (
          <div key={`${idPrefix}-summary-${i}`} className={summaryCellClass(i, i === 0)}>
            {slot}
          </div>
        ) : null,
      )}
    </div>
  )
}
