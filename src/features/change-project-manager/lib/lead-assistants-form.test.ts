import { describe, expect, it } from 'vitest'

import type { ManagerSelectOption } from '@/entities/manager'

import {
  getLeadAssistantsErrorMessage,
  resolveLeadAssistantsState,
  setLead,
  toggleAssistant,
  type LeadAssistantsSelection,
} from './lead-assistants-form'

const OPTIONS: ManagerSelectOption[] = [
  { id: '1', fullName: 'Аникин' },
  { id: '2', fullName: 'Бирюков' },
  { id: '3', fullName: 'Власов' },
]

const EMPTY: LeadAssistantsSelection = { leadId: null, assistantIds: [] }

describe('resolveLeadAssistantsState', () => {
  it('опция ведущего дизейблится, если выбрана как вспомогательная', () => {
    const state = resolveLeadAssistantsState({
      assignableOptions: OPTIONS,
      selection: { leadId: null, assistantIds: ['2'] },
      initial: EMPTY,
    })
    expect(state.leadOptions.find((o) => o.id === '2')?.disabled).toBe(true)
    expect(state.leadOptions.find((o) => o.id === '1')?.disabled).toBe(false)
  })

  it('опция вспомогательного дизейблится, если выбрана как ведущий', () => {
    const state = resolveLeadAssistantsState({
      assignableOptions: OPTIONS,
      selection: { leadId: '1', assistantIds: [] },
      initial: EMPTY,
    })
    expect(state.assistantOptions.find((o) => o.id === '1')?.disabled).toBe(true)
  })

  it('lead_required, если ведущий не выбран, а вспомогательные есть', () => {
    const state = resolveLeadAssistantsState({
      assignableOptions: OPTIONS,
      selection: { leadId: null, assistantIds: ['2'] },
      initial: EMPTY,
    })
    expect(state.errorKey).toBe('lead_required')
    expect(state.canApply).toBe(false)
  })

  it('нет ошибки, если ведущий выбран при наличии вспомогательных', () => {
    const state = resolveLeadAssistantsState({
      assignableOptions: OPTIONS,
      selection: { leadId: '1', assistantIds: ['2'] },
      initial: EMPTY,
    })
    expect(state.errorKey).toBeNull()
  })

  it('нет ошибки и можно применить при «снять всё»', () => {
    const state = resolveLeadAssistantsState({
      assignableOptions: OPTIONS,
      selection: EMPTY,
      initial: { leadId: '1', assistantIds: [] },
    })
    expect(state.errorKey).toBeNull()
    expect(state.canApply).toBe(true)
  })

  it('canApply=false без изменений', () => {
    const state = resolveLeadAssistantsState({
      assignableOptions: OPTIONS,
      selection: { leadId: '1', assistantIds: ['2'] },
      initial: { leadId: '1', assistantIds: ['2'] },
    })
    expect(state.hasChanges).toBe(false)
    expect(state.canApply).toBe(false)
  })

  it('canApply=true при изменениях без ошибки', () => {
    const state = resolveLeadAssistantsState({
      assignableOptions: OPTIONS,
      selection: { leadId: '1', assistantIds: ['2'] },
      initial: { leadId: '1', assistantIds: [] },
    })
    expect(state.canApply).toBe(true)
  })

  it('hasChanges при смене ведущего', () => {
    const state = resolveLeadAssistantsState({
      assignableOptions: OPTIONS,
      selection: { leadId: '2', assistantIds: [] },
      initial: { leadId: '1', assistantIds: [] },
    })
    expect(state.hasChanges).toBe(true)
  })

  it('hasChanges при добавлении вспомогательного', () => {
    const state = resolveLeadAssistantsState({
      assignableOptions: OPTIONS,
      selection: { leadId: '1', assistantIds: ['2'] },
      initial: { leadId: '1', assistantIds: [] },
    })
    expect(state.hasChanges).toBe(true)
  })

  it('hasChanges не зависит от порядка вспомогательных', () => {
    const state = resolveLeadAssistantsState({
      assignableOptions: OPTIONS,
      selection: { leadId: '1', assistantIds: ['3', '2'] },
      initial: { leadId: '1', assistantIds: ['2', '3'] },
    })
    expect(state.hasChanges).toBe(false)
  })
})

describe('toggleAssistant', () => {
  it('добавляет вспомогательного', () => {
    expect(toggleAssistant({ leadId: '1', assistantIds: [] }, '2').assistantIds).toEqual(['2'])
  })

  it('удаляет вспомогательного', () => {
    expect(toggleAssistant({ leadId: '1', assistantIds: ['2'] }, '2').assistantIds).toEqual([])
  })

  it('не дублирует уже добавленного', () => {
    const result = toggleAssistant({ leadId: '1', assistantIds: ['2'] }, '2')
    expect(result.assistantIds).toEqual([])
  })

  it('не мутирует вход', () => {
    const selection: LeadAssistantsSelection = { leadId: '1', assistantIds: ['2'] }
    toggleAssistant(selection, '3')
    expect(selection.assistantIds).toEqual(['2'])
  })
})

describe('setLead', () => {
  it('устанавливает ведущего', () => {
    expect(setLead(EMPTY, '1').leadId).toBe('1')
  })

  it('снимает ведущего при null', () => {
    expect(setLead({ leadId: '1', assistantIds: [] }, null).leadId).toBeNull()
  })

  it('убирает нового ведущего из вспомогательных', () => {
    const result = setLead({ leadId: '1', assistantIds: ['2', '3'] }, '2')
    expect(result.leadId).toBe('2')
    expect(result.assistantIds).toEqual(['3'])
  })

  it('не мутирует вход', () => {
    const selection: LeadAssistantsSelection = { leadId: '1', assistantIds: ['2'] }
    setLead(selection, '2')
    expect(selection.assistantIds).toEqual(['2'])
  })
})

describe('getLeadAssistantsErrorMessage', () => {
  it('возвращает текст для lead_required', () => {
    expect(getLeadAssistantsErrorMessage('lead_required')).toContain('ведущего')
  })
})
