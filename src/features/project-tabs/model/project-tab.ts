import { useSearchParams } from 'react-router-dom'

import { useUserRole } from '@/entities/user-role'

export type ProjectTabKey = 'data' | 'economics' | 'documents' | 'actions' | 'reminders'

export const PROJECT_TABS: { key: ProjectTabKey; label: string; mobileLabel: string }[] = [
  { key: 'data', label: 'Данные о проекте', mobileLabel: 'Данные' },
  { key: 'economics', label: 'Экономика', mobileLabel: 'Экономика' },
  { key: 'documents', label: 'Документы', mobileLabel: 'Документы' },
  { key: 'actions', label: 'Лог действий', mobileLabel: 'Лог' },
  { key: 'reminders', label: 'Напоминания', mobileLabel: 'Напоминания' },
]

const DEFAULT_TAB: ProjectTabKey = 'data'

/** У руководителя нет логики напоминаний — таб скрыт. */
export function useProjectTabsForRole() {
  const role = useUserRole()
  return PROJECT_TABS.filter((t) => t.key !== 'reminders' || role !== 'director')
}

export function useProjectTab(): [ProjectTabKey, (next: ProjectTabKey) => void] {
  const [params, setParams] = useSearchParams()
  const availableTabs = useProjectTabsForRole()
  const raw = params.get('tab') as ProjectTabKey | null
  const current = raw && availableTabs.some((t) => t.key === raw) ? raw : DEFAULT_TAB
  const setTab = (next: ProjectTabKey) => {
    const nextParams = new URLSearchParams(params)
    if (next === DEFAULT_TAB) nextParams.delete('tab')
    else nextParams.set('tab', next)
    setParams(nextParams, { replace: true })
  }
  return [current, setTab]
}
