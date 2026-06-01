import { describe, expect, it } from 'vitest'

import {
  CLOSED_REQUESTS_BACK_ORIGIN,
  CLOSING_BACK_ORIGIN,
  DEFAULT_PROJECTS_BACK_ORIGIN,
  REQUESTS_BACK_ORIGIN,
} from '../model/project-back-origins'
import { projectDetailPath } from './project-detail-path'

describe('projectDetailPath', () => {
  it('без backOrigin ведёт на /projects/:id', () => {
    expect(projectDetailPath(42)).toBe('/projects/42')
    expect(projectDetailPath('abc')).toBe('/projects/abc')
  })

  it('маппит список закрытия на /closing/:id', () => {
    expect(projectDetailPath(1, CLOSING_BACK_ORIGIN)).toBe('/closing/1')
  })

  it('маппит legacy /closed-projects на /closing/:id', () => {
    expect(projectDetailPath(5, { to: '/closed-projects', label: 'Закрытые проекты' })).toBe(
      '/closing/5',
    )
  })

  it('маппит разделы проектов и запросов бухгалтера', () => {
    expect(projectDetailPath(10, DEFAULT_PROJECTS_BACK_ORIGIN)).toBe('/projects/10')
    expect(projectDetailPath(11, REQUESTS_BACK_ORIGIN)).toBe('/requests/11')
    expect(projectDetailPath(12, CLOSED_REQUESTS_BACK_ORIGIN)).toBe('/closed-requests/12')
  })

  it('для неизвестного listRoute fallback на /projects', () => {
    expect(projectDetailPath(99, { to: '/unknown', label: 'X' })).toBe('/projects/99')
  })
})
