import { describe, expect, it } from 'vitest'

import type { Project } from '@/entities/project'

import { filterCalendarProjects, type CalendarProjectsFilter } from './filter-calendar-projects'

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: '1',
    title: 'Свадьба',
    date: '2026-05-10',
    stage: 'calculation_prepared',
    city: '',
    loft: 'Loft Центр',
    hall: 'Зал A',
    hallLoft: 'Loft Центр · Зал A',
    manager: 'Иванов',
    type: 'Свадьба',
    company: 'ООО Ромашка',
    phone: '+7 999 000-00-00',
    email: '',
    plumCardUrl: '',
    isFromPlum: true,
    plumEventStatus: 4,
    plumEventStatusLabel: 'Заявка',
    updatedAt: '',
    createdAt: '',
    ...overrides,
  }
}

const emptyFilter: CalendarProjectsFilter = {
  search: '',
  hall: null,
  loft: null,
  plumEventStatus: [],
}

describe('filterCalendarProjects', () => {
  it('возвращает все проекты при пустых фильтрах', () => {
    const projects = [makeProject({ id: '1' }), makeProject({ id: '2', title: 'Корпоратив' })]
    expect(filterCalendarProjects(projects, emptyFilter)).toHaveLength(2)
  })

  it('фильтрует по подстроке hallLoft для зала', () => {
    const projects = [
      makeProject({ id: '1', hallLoft: 'Loft Центр · Зал A' }),
      makeProject({ id: '2', hallLoft: 'Loft Юг · Зал B' }),
    ]
    expect(filterCalendarProjects(projects, { ...emptyFilter, hall: 'Зал A' }).map((p) => p.id)).toEqual(
      ['1'],
    )
  })

  it('фильтрует по подстроке hallLoft для лофта', () => {
    const projects = [
      makeProject({ id: '1', hallLoft: 'Loft Центр · Зал A' }),
      makeProject({ id: '2', hallLoft: 'Loft Юг · Зал B' }),
    ]
    expect(filterCalendarProjects(projects, { ...emptyFilter, loft: 'Loft Юг' }).map((p) => p.id)).toEqual(
      ['2'],
    )
  })

  it('ищет по title и manager', () => {
    const projects = [
      makeProject({ id: '1', title: 'Свадьба', manager: 'Иванов' }),
      makeProject({ id: '2', title: 'Корпоратив', manager: 'Петров' }),
    ]
    expect(filterCalendarProjects(projects, { ...emptyFilter, search: 'петр' }).map((p) => p.id)).toEqual(
      ['2'],
    )
    expect(filterCalendarProjects(projects, { ...emptyFilter, search: '  свадьба  ' }).map((p) => p.id)).toEqual(
      ['1'],
    )
  })

  it('фильтрует по одному статусу Plum', () => {
    const projects = [
      makeProject({ id: '1', plumEventStatus: 4 }),
      makeProject({ id: '2', plumEventStatus: 6 }),
      makeProject({ id: '3', plumEventStatus: null, isFromPlum: false }),
    ]
    expect(
      filterCalendarProjects(projects, { ...emptyFilter, plumEventStatus: ['4'] }).map((p) => p.id),
    ).toEqual(['1'])
  })

  it('фильтрует по нескольким статусам Plum', () => {
    const projects = [
      makeProject({ id: '1', plumEventStatus: 4 }),
      makeProject({ id: '2', plumEventStatus: 6 }),
      makeProject({ id: '3', plumEventStatus: 11 }),
    ]
    expect(
      filterCalendarProjects(projects, { ...emptyFilter, plumEventStatus: ['4', '11'] }).map(
        (p) => p.id,
      ),
    ).toEqual(['1', '3'])
  })

  it('отбрасывает проекты без plumEventStatus, если фильтр включён', () => {
    const projects = [
      makeProject({ id: '1', plumEventStatus: 4 }),
      makeProject({ id: '2', plumEventStatus: null }),
    ]
    expect(
      filterCalendarProjects(projects, { ...emptyFilter, plumEventStatus: ['4'] }).map((p) => p.id),
    ).toEqual(['1'])
  })

  it('комбинирует фильтр Plum с поиском и залом', () => {
    const projects = [
      makeProject({
        id: '1',
        title: 'Свадьба',
        hallLoft: 'Loft Центр · Зал A',
        plumEventStatus: 4,
      }),
      makeProject({
        id: '2',
        title: 'Свадьба',
        hallLoft: 'Loft Центр · Зал B',
        plumEventStatus: 4,
      }),
      makeProject({
        id: '3',
        title: 'Корпоратив',
        hallLoft: 'Loft Центр · Зал A',
        plumEventStatus: 6,
      }),
    ]
    expect(
      filterCalendarProjects(projects, {
        search: 'свадьба',
        hall: 'Зал A',
        loft: null,
        plumEventStatus: ['4'],
      }).map((p) => p.id),
    ).toEqual(['1'])
  })
})
