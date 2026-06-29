import type { ArticleKind, ArticlesBlockMap, FinanceAspect } from '@/entities/project-article'

/**
 * UI-`kind` → ключ в block-PATCH-телах (`/sales/`, `/expenses/`). Совпадает 1:1,
 * КРОМЕ `sublease` → `subrent` (расхождение имён UI и API). В transition-body
 * имена совпадают с UI, поэтому там это отображение не нужно.
 */
export const ARTICLE_KIND_TO_API: Record<ArticleKind, string> = {
  equipment: 'equipment',
  personnel: 'personnel',
  sublease: 'subrent',
  transport: 'transport',
  internet: 'internet',
  consumables: 'consumables',
  screen: 'screen',
  tm: 'tm',
}

/** Число → decimal-строка для API (две цифры после точки). Пусто/невалид → undefined. */
export function toDecimalString(value: number | null | undefined): string | undefined {
  if (value === null || value === undefined || !Number.isFinite(value)) return undefined
  return value.toFixed(2)
}

/**
 * Блок статей → плоская карта `apiKey → decimal` для одного аспекта (sales|expense).
 * Незаполненные статьи (`null`) пропускаются — partial update не трогает их на бэке.
 */
export function blockAspectToDecimals(
  block: ArticlesBlockMap,
  aspect: FinanceAspect,
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const kind of Object.keys(block) as ArticleKind[]) {
    const dec = toDecimalString(block[kind][aspect])
    if (dec !== undefined) out[ARTICLE_KIND_TO_API[kind]] = dec
  }
  return out
}
