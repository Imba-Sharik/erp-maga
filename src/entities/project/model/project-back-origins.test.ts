import { describe, expect, it } from 'vitest'

import {
  CLOSED_REQUESTS_BACK_ORIGIN,
  CLOSING_BACK_ORIGIN,
  DEFAULT_PROJECTS_BACK_ORIGIN,
  OUTSIDE_MAG_BACK_ORIGIN,
  REQUESTS_BACK_ORIGIN,
  resolveProjectBackFromPathname,
  resolveRequestBackFromPathname,
} from './project-back-origins'

describe('resolveProjectBackFromPathname', () => {
  it('возвращает закрытие для /closing/:id', () => {
    expect(resolveProjectBackFromPathname('/closing/42')).toEqual(CLOSING_BACK_ORIGIN)
    expect(resolveProjectBackFromPathname('/closing/42/stages')).toEqual(CLOSING_BACK_ORIGIN)
  })

  it('возвращает «Вне контура MAG» для /outside-mag/:id', () => {
    expect(resolveProjectBackFromPathname('/outside-mag/3')).toEqual(OUTSIDE_MAG_BACK_ORIGIN)
  })

  it('возвращает проекты для /projects/:id и прочих путей', () => {
    expect(resolveProjectBackFromPathname('/projects/1')).toEqual(DEFAULT_PROJECTS_BACK_ORIGIN)
    expect(resolveProjectBackFromPathname('/dashboard')).toEqual(DEFAULT_PROJECTS_BACK_ORIGIN)
  })
})

describe('resolveRequestBackFromPathname', () => {
  it('возвращает закрытые запросы для /closed-requests/:id', () => {
    expect(resolveRequestBackFromPathname('/closed-requests/7')).toEqual(
      CLOSED_REQUESTS_BACK_ORIGIN,
    )
  })

  it('возвращает запросы для /requests/:id и прочих путей', () => {
    expect(resolveRequestBackFromPathname('/requests/3')).toEqual(REQUESTS_BACK_ORIGIN)
    expect(resolveRequestBackFromPathname('/notifications')).toEqual(REQUESTS_BACK_ORIGIN)
  })
})
