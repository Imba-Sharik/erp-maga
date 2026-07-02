import type {
  ArticleBlock,
  ArticleKind,
  ArticlesBlockMap,
  ProjectArticles,
} from '@/entities/project-article'
import type {
  BonusArticleOverrideSchemaRequest,
  BonusArticleOverrideSchemaRequestKindEnumKey,
} from '@/shared/api/generated/types/BonusArticleOverrideSchemaRequest'
import type { PatchedBonusBlockUpdateSchemaRequest } from '@/shared/api/generated/types/PatchedBonusBlockUpdateSchemaRequest'

import { toDecimalString } from './articles-to-decimals'

function blockBonusOverrides(
  block: ArticleBlock,
  map: ArticlesBlockMap,
): BonusArticleOverrideSchemaRequest[] {
  const out: BonusArticleOverrideSchemaRequest[] = []
  for (const kind of Object.keys(map) as ArticleKind[]) {
    const amount = toDecimalString(map[kind].bonusAmount)
    if (amount === undefined) continue
    out.push({
      block,
      kind: kind as BonusArticleOverrideSchemaRequestKindEnumKey,
      bonus_amount: amount,
    })
  }
  return out
}

/**
 * UI → PATCH /projects/{id}/bonus/ (этап `bonus_calculated`, правка задним числом).
 * Тело — ручные override'ы бонуса по статьям `{ block, kind, bonus_amount }`. Шлём
 * все статьи с заданной суммой (в т.ч. гидрированные с бэка и не тронутые
 * пользователем): бэк идемпотентен к равным значениям — `update_bonus` пишет
 * `bonus_amount` всегда, но аудит `bonus_manual_change` создаёт только при реальном
 * изменении, а пересчёт бонуса (правка продаж/расходов) перетирает эти значения
 * формулой. Имена статей — фронтовые (`sublease`), как ждёт эндпоинт.
 */
export function buildBonusPatchBody({
  articles,
}: {
  articles: ProjectArticles
}): PatchedBonusBlockUpdateSchemaRequest | null {
  const list = [
    ...blockBonusOverrides('main', articles.main),
    ...(articles.backline ? blockBonusOverrides('backline', articles.backline) : []),
  ]
  return list.length > 0 ? { articles: list } : null
}
