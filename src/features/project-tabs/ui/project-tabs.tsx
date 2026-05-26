import { useSearchParams } from 'react-router-dom'

import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

export type ProjectTabKey = 'data' | 'economics' | 'documents' | 'actions'

const TABS: { key: ProjectTabKey; label: string; mobileLabel: string }[] = [
  { key: 'data', label: 'Данные о проекте', mobileLabel: 'Данные' },
  { key: 'economics', label: 'Экономика', mobileLabel: 'Экономика' },
  { key: 'documents', label: 'Документы', mobileLabel: 'Документы' },
  { key: 'actions', label: 'Лог действий', mobileLabel: 'Лог' },
]

const DEFAULT_TAB: ProjectTabKey = 'data'

export function useProjectTab(): [ProjectTabKey, (next: ProjectTabKey) => void] {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab') as ProjectTabKey | null
  const current = raw && TABS.some((t) => t.key === raw) ? raw : DEFAULT_TAB
  const setTab = (next: ProjectTabKey) => {
    const nextParams = new URLSearchParams(params)
    if (next === DEFAULT_TAB) nextParams.delete('tab')
    else nextParams.set('tab', next)
    setParams(nextParams, { replace: true })
  }
  return [current, setTab]
}

export function ProjectTabs() {
  const [tab, setTab] = useProjectTab()

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as ProjectTabKey)}>
      <TabsList className="h-auto gap-1.5 bg-transparent p-0 max-lg:grid max-lg:h-auto! max-lg:w-full max-lg:grid-cols-2">
        {TABS.map((t) => (
          <TabsTrigger
            key={t.key}
            value={t.key}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-10 cursor-pointer rounded-[10px] border border-[#B1B1B1] bg-white px-4 py-1.5 text-sm font-normal text-[#454545] data-[state=active]:border-transparent data-[state=active]:shadow-none max-lg:h-9 max-lg:w-full max-lg:flex-none max-lg:px-3 max-lg:text-xs"
          >
            <span className="lg:hidden">{t.mobileLabel}</span>
            <span className="hidden lg:inline">{t.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
