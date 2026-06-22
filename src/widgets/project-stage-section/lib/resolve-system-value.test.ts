import { describe, expect, it } from 'vitest'

import type { ProjectDetail } from '@/entities/project'
import { createInitialArticles, formatMoney } from '@/entities/project-articles'
import type { StageRecord } from '@/features/advance-stage'

import { resolveSystemValue } from './resolve-system-value'

const project = { manager: 'Ведущий менеджер' } as ProjectDetail

function resolveDataConfirmedBy(record?: StageRecord) {
  return resolveSystemValue('dataConfirmedBy', {
    project,
    stage: 'data_confirmed',
    record,
  })
}

describe('resolveSystemValue — dataConfirmedBy', () => {
  it('берёт values.dataConfirmedBy в первую очередь', () => {
    expect(
      resolveDataConfirmedBy({
        values: { dataConfirmedBy: 'Петров Пётр Петрович' },
        completedBy: 'Сидоров',
        enteredBy: 'Иванов',
      }),
    ).toBe('Петров Пётр Петрович')
  })

  it('fallback на completedBy (локальный flow после submit)', () => {
    expect(
      resolveDataConfirmedBy({
        completedBy: 'Сидоров Сидор Сидорович',
        enteredBy: 'Иванов Иван Иванович',
      }),
    ).toBe('Сидоров Сидор Сидорович')
  })

  it('fallback на enteredBy (старый маппинг с бэка)', () => {
    expect(resolveDataConfirmedBy({ enteredBy: 'Иванов Иван Иванович' })).toBe(
      'Иванов Иван Иванович',
    )
  })

  it('возвращает undefined без записи', () => {
    expect(resolveDataConfirmedBy()).toBeUndefined()
  })
})

describe('resolveSystemValue — dataConfirmedAt', () => {
  it('берёт values.dataConfirmedAt с бэка', () => {
    expect(
      resolveSystemValue('dataConfirmedAt', {
        project,
        stage: 'data_confirmed',
        record: { values: { dataConfirmedAt: '2026-05-01T12:00:00Z' } },
      }),
    ).toBe('2026-05-01T12:00:00Z')
  })
})

// Регрессия: поле раньше игнорировало реальный record и всегда показывало mock «Был готов».
describe('resolveSystemValue — eventReadiness (бывший mock-баг)', () => {
  const resolve = (record?: StageRecord) =>
    resolveSystemValue('eventReadiness', { project, stage: 'event_held', record })

  it("'ready' -> «Был готов»", () => {
    expect(resolve({ values: { eventReadiness: 'ready' } })).toBe('Был готов')
  })

  it("'not_ready' -> «Не был готов» (а не выдуманное «Был готов»)", () => {
    expect(resolve({ values: { eventReadiness: 'not_ready' } })).toBe('Не был готов')
  })

  it('нет значения -> undefined (никакого mock)', () => {
    expect(resolve({ values: {} })).toBeUndefined()
    expect(resolve(undefined)).toBeUndefined()
  })
})

describe('resolveSystemValue — даты/менеджер из реальных данных, без mock-fallback', () => {
  it('createdAt берётся из project.enteredSystemAt', () => {
    const withDate = { ...project, enteredSystemAt: '2026-01-02T00:00:00Z' } as ProjectDetail
    expect(resolveSystemValue('createdAt', { project: withDate, stage: 'plum_request' })).toBe(
      '2026-01-02T00:00:00Z',
    )
  })

  it('createdAt -> undefined, если enteredSystemAt пуст (а не demo-дата)', () => {
    const noDate = { ...project, enteredSystemAt: '' } as ProjectDetail
    expect(
      resolveSystemValue('createdAt', { project: noDate, stage: 'plum_request' }),
    ).toBeUndefined()
  })

  it('eventDate берётся из project.date, иначе undefined', () => {
    const withDate = { ...project, date: '2026-05-09' } as ProjectDetail
    expect(resolveSystemValue('eventDate', { project: withDate, stage: 'event_held' })).toBe(
      '2026-05-09',
    )
    const noDate = { ...project, date: '' } as ProjectDetail
    expect(
      resolveSystemValue('eventDate', { project: noDate, stage: 'event_held' }),
    ).toBeUndefined()
  })

  it('leadManager на closed/bonus_calculated -> главный менеджер проекта', () => {
    expect(resolveSystemValue('leadManager', { project, stage: 'closed' })).toBe('Ведущий менеджер')
    expect(resolveSystemValue('leadManager', { project, stage: 'bonus_calculated' })).toBe(
      'Ведущий менеджер',
    )
  })

  it('leadManager на прочих этапах -> автор входа (record.enteredBy), иначе undefined', () => {
    expect(
      resolveSystemValue('leadManager', {
        project,
        stage: 'primary_contact_done',
        record: { enteredBy: 'Семёнова Анна' },
      }),
    ).toBe('Семёнова Анна')
    // Нет записи -> пусто, а не demo-имя «Иванов Иван Иванович».
    expect(
      resolveSystemValue('leadManager', { project, stage: 'primary_contact_done' }),
    ).toBeUndefined()
  })
})

describe('resolveSystemValue — финансовые суммы только из реальных статей', () => {
  it('totalBonus суммирует бонусы по статьям (формула + override руководителя)', () => {
    // equipment: (1 000 000 − 400 000) × 50% = 300 000; personnel: override 30 000; остальные 0.
    // Итого 330 000. Число выведено вручную (не через bonusTotal) — тест не тавтологичен.
    const articles = createInitialArticles()
    articles.main.equipment = { sales: 1_000_000, expense: 400_000, bonusPercent: 50 }
    articles.main.personnel = { sales: 0, expense: 0, bonusPercent: 0, bonusAmount: 30_000 }
    expect(resolveSystemValue('totalBonus', { project, stage: 'bonus_approved', articles })).toBe(
      formatMoney(330_000),
    )
  })

  it('totalBonus -> undefined без статей (никаких выдуманных сумм)', () => {
    expect(resolveSystemValue('totalBonus', { project, stage: 'bonus_approved' })).toBeUndefined()
  })

  // Ядро фикса №1: системные поля без явного источника НИКОГДА не возвращают выдуманное
  // значение. Раньше они падали в `default: return fallback` и показывали mock-суммы.
  it.each([
    'salesMainTotal',
    'salesBacklineTotal',
    'salesProjectTotal',
    'taxAmount',
    'expensesMainTotal',
    'expensesBacklineTotal',
    'expensesProjectTotal',
    'netProfitTotal',
    'calculatedBonus',
  ] as const)('поле %s без источника -> undefined (а не mock-сумма)', (field) => {
    const articles = createInitialArticles()
    expect(
      resolveSystemValue(field, { project, stage: 'bonus_calculated', articles }),
    ).toBeUndefined()
  })
})
