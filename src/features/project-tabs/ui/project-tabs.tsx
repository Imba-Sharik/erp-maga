import { useSearchParams } from 'react-router-dom'

import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

export type ProjectTabKey = 'data' | 'economics' | 'documents' | 'actions'

const TABS: { key: ProjectTabKey; label: string }[] = [
  { key: 'data', label: 'Данные о проекте' },
  { key: 'economics', label: 'Экономика' },
  { key: 'documents', label: 'Документы' },
  { key: 'actions', label: 'Лог действий' },
]

// disabled до проработки вкладок «Документы» и «Лог действий»
const DISABLED_TAB_KEYS = new Set<ProjectTabKey>(['documents', 'actions'])

const DEFAULT_TAB: ProjectTabKey = 'data'

function isTabEnabled(key: ProjectTabKey): boolean {
  return !DISABLED_TAB_KEYS.has(key)
}

export function useProjectTab(): [ProjectTabKey, (next: ProjectTabKey) => void] {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab') as ProjectTabKey | null
  const current =
    raw && TABS.some((t) => t.key === raw) && isTabEnabled(raw) ? raw : DEFAULT_TAB
  const setTab = (next: ProjectTabKey) => {
    if (!isTabEnabled(next)) return
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
            disabled={!isTabEnabled(t.key)}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-[10px] border border-[#B1B1B1] bg-white px-4 py-1.5 text-sm font-normal text-[#454545] data-[state=active]:border-transparent data-[state=active]:font-medium data-[state=active]:shadow-none disabled:cursor-not-allowed disabled:border-[#D4D4D4] disabled:bg-[#F0F0F0] disabled:text-[#ACACAC] disabled:opacity-100"
          >
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
