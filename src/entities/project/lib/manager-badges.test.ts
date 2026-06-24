import { describe, expect, it } from 'vitest'

import { resolveManagerBadges, type ResolveManagerBadgesInput } from './manager-badges'

const base: ResolveManagerBadgesInput = {
  isManager: true,
  isLeadManager: false,
  leadName: 'Иванов Иван',
  assistantNames: [],
}

describe('resolveManagerBadges', () => {
  it('менеджер-владелец → строка «Ведущий» зелёная (managerSelf)', () => {
    const [lead] = resolveManagerBadges({ ...base, isLeadManager: true })
    expect(lead).toMatchObject({ kind: 'lead', variant: 'managerSelf' })
  })

  it('менеджер-не-владелец → «Ведущий» жёлтая (warning)', () => {
    const [lead] = resolveManagerBadges({ ...base, isLeadManager: false })
    expect(lead.variant).toBe('warning')
  })

  it('не-менеджер (director) → «Ведущий» нейтральная (серая)', () => {
    const [lead] = resolveManagerBadges({ ...base, isManager: false, isLeadManager: true })
    expect(lead.variant).toBe('managerNeutral')
  })

  it('вспомогательные всегда серые — у владельца', () => {
    const rows = resolveManagerBadges({ ...base, isLeadManager: true, assistantNames: ['Петров'] })
    expect(rows.find((r) => r.kind === 'assistant')?.variant).toBe('managerNeutral')
  })

  it('вспомогательные всегда серые — у director', () => {
    const rows = resolveManagerBadges({ ...base, isManager: false, assistantNames: ['Петров'] })
    expect(rows.find((r) => r.kind === 'assistant')?.variant).toBe('managerNeutral')
  })

  it('без вспомогательных — одна строка', () => {
    expect(resolveManagerBadges(base)).toHaveLength(1)
  })

  it('каждый вспомогательный — отдельная строка', () => {
    expect(
      resolveManagerBadges({ ...base, assistantNames: ['Петров', 'Сидоров'] }),
    ).toHaveLength(3)
  })

  it('подпись ведущего с именем; каждый вспомогательный отдельной плашкой', () => {
    const rows = resolveManagerBadges({ ...base, assistantNames: ['Петров', 'Сидоров'] })
    expect(rows[0].text).toBe('Ведущий: Иванов Иван')
    expect(rows[1].text).toBe('Вспом.: Петров')
    expect(rows[2].text).toBe('Вспом.: Сидоров')
  })

  it('лид не назначен → «—», нейтральная даже у менеджера', () => {
    const [lead] = resolveManagerBadges({ ...base, isLeadManager: true, leadName: '' })
    expect(lead.text).toBe('Ведущий: —')
    expect(lead.variant).toBe('managerNeutral')
  })

  it('«я среди вспомогательных» — строка всё равно серая', () => {
    const rows = resolveManagerBadges({ ...base, isLeadManager: false, assistantNames: ['Я'] })
    expect(rows.find((r) => r.kind === 'assistant')?.variant).toBe('managerNeutral')
  })
})
