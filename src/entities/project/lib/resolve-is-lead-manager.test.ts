import { describe, expect, it } from 'vitest'

import { resolveIsLeadManager } from './resolve-is-lead-manager'

describe('resolveIsLeadManager', () => {
  it('true при явном is_lead_manager=true', () => {
    expect(resolveIsLeadManager({ is_lead_manager: true })).toBe(true)
  })

  it('false при is_lead_manager=false', () => {
    expect(resolveIsLeadManager({ is_lead_manager: false })).toBe(false)
  })

  it('false без явного флага (строгий дефолт)', () => {
    expect(resolveIsLeadManager({})).toBe(false)
  })

  it('false при can_edit=true без флага ведущего (вспомогательный не получает зелёный)', () => {
    // can_edit у вспомогательного тоже true — он не должен трактоваться как ведущий.
    expect(resolveIsLeadManager({ can_edit: true } as never)).toBe(false)
  })
})
