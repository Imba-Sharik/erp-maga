import { useSearchParams } from 'react-router-dom'

import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

export type ProjectTabKey = 'data' | 'economics' | 'documents' | 'actions'

const TABS: { key: ProjectTabKey; label: string }[] = [
  { key: 'data', label: 'Данные о проекте' },
  { key: 'economics', label: 'Экономика' },
  { key: 'documents', label: 'Документы' },
  { key: 'actions', label: 'Лог действий' },
]

const DEFAULT_TAB: ProjectTabKey = 'data'

export function useProjectTab(): [ProjectTabKey, (next: ProjectTabKey) => void] {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab') as ProjectTabKey | null
  const current = TABS.some((t) => t.key === raw) ? (raw as ProjectTabKey) : DEFAULT_TAB
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
      <TabsList className="h-auto gap-1.5 bg-transparent p-0">
        {TABS.map((t) => (
          <TabsTrigger
            key={t.key}
            value={t.key}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-[10px] border border-[#B1B1B1] bg-white px-4 py-1.5 text-[13px] font-normal text-[#454545] data-[state=active]:border-transparent data-[state=active]:font-medium data-[state=active]:shadow-none"
          >
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
