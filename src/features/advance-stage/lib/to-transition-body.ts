import type {
  ArticleBlock,
  ArticlesBlockMap,
  ProjectArticles,
} from '@/entities/project-articles'
import type { ProjectStage, StageFormData } from '@/entities/project'
import type { ProjectTransitionRequest } from '@/shared/api/generated/types/ProjectTransitionRequest'
import type { ToStageEnum } from '@/shared/api/generated/types/ToStageEnum'
import type { TransitionArticleRequest } from '@/shared/api/generated/types/TransitionArticleRequest'

/** Стейджи воронки = подмножество ToStageEnum, имена совпадают 1:1. */
function toStage(stage: ProjectStage): ToStageEnum {
  return stage as ToStageEnum
}

function toDecimalString(value: number | undefined): string | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined
  return value.toFixed(2)
}

function blockToArticles(
  block: ArticleBlock,
  map: ArticlesBlockMap,
  aspect: 'sales' | 'expense' | 'bonus',
): TransitionArticleRequest[] {
  const result: TransitionArticleRequest[] = []
  for (const [kind, values] of Object.entries(map)) {
    const entry: TransitionArticleRequest = {
      block,
      kind: kind as TransitionArticleRequest['kind'],
    }
    if (aspect === 'sales') entry.sales = toDecimalString(values.sales)
    else if (aspect === 'expense') entry.expense = toDecimalString(values.expense)
    else if (aspect === 'bonus') entry.bonus_amount = toDecimalString(values.bonusAmount)
    result.push(entry)
  }
  return result
}

/**
 * `tax_rate` на UI хранится в `taxRate` (number в %, например 15).
 * Бэкенд ждёт decimal-строку — отправляем как есть.
 */
function buildArticles(
  stage: ProjectStage,
  articles: ProjectArticles,
): TransitionArticleRequest[] | undefined {
  let aspect: 'sales' | 'expense' | 'bonus' | null = null
  if (stage === 'ready_to_event') aspect = 'sales'
  else if (stage === 'expenses_entered') aspect = 'expense'
  else if (stage === 'bonus_calculated') aspect = 'bonus'
  if (!aspect) return undefined

  const list = blockToArticles('main', articles.main, aspect)
  if (articles.backline) {
    list.push(...blockToArticles('backline', articles.backline, aspect))
  }
  return list
}

interface BuildTransitionBodyArgs {
  currentStage: ProjectStage
  nextStage: ProjectStage
  values?: Partial<StageFormData>
  articles: ProjectArticles
  taxRate: number
}

/**
 * Плоское тело POST /projects/{id}/transitions/.
 * Бэк игнорирует поля, не относящиеся к этапу — отправляем всё что заполнено.
 */
export function buildTransitionBody({
  currentStage,
  nextStage,
  values,
  articles,
  taxRate,
}: BuildTransitionBodyArgs): ProjectTransitionRequest {
  const v = values ?? {}
  const body: ProjectTransitionRequest = { to_stage: toStage(nextStage) }

  if (v.clientCompany) body.client_company = v.clientCompany
  if (v.phone) body.phone = v.phone
  if (v.contactPerson) body.contact_person = v.contactPerson
  if (v.email) body.email = v.email
  if (v.contactComment) body.contact_comment = v.contactComment
  if (v.contactChannel) body.contact_channel = v.contactChannel
  if (v.calcComment) body.calculation_comment = v.calcComment
  if (v.contractType) body.contract_type = v.contractType
  if (v.contractNumber) body.contract_number = v.contractNumber
  if (v.contractDate) body.contract_date = v.contractDate
  if (v.legalEntity) body.legal_entity = v.legalEntity
  if (v.contractComment) body.contract_comment = v.contractComment
  if (v.postEventComment) body.post_event_comment = v.postEventComment
  if (v.projectDocsStatus) body.project_docs_status = v.projectDocsStatus
  if (v.subleaseDocsStatus) body.sublease_docs_status = v.subleaseDocsStatus
  if (v.staffReceiptsStatus) body.staff_receipts_status = v.staffReceiptsStatus
  if (v.dataConfirmedStatus) {
    body.data_confirmed_status = v.dataConfirmedStatus as ProjectTransitionRequest['data_confirmed_status']
  }

  // tax_rate обязателен для перехода ready_to_event → event_held.
  // Бэк не принимает отсутствие поля — если менеджер не заполнил процент, шлём 0.
  if (currentStage === 'ready_to_event') {
    body.tax_rate = taxRate.toFixed(2)
  }

  const articleList = buildArticles(currentStage, articles)
  if (articleList) body.articles = articleList

  return body
}
