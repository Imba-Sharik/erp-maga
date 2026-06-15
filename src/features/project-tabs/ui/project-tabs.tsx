import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

import { useProjectTab, useProjectTabsForRole, type ProjectTabKey } from '../model/project-tab'

export function ProjectTabs() {
  const [tab, setTab] = useProjectTab()
  const tabs = useProjectTabsForRole()

  return (
    <>
      <Select value={tab} onValueChange={(v) => setTab(v as ProjectTabKey)}>
        <SelectTrigger
          aria-label="Раздел проекта"
          className="h-10! w-full rounded-[10px] border-[#B1B1B1] bg-white text-sm font-normal text-[#454545] @[820px]/tabrow:hidden"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {tabs.map((t) => (
            <SelectItem key={t.key} value={t.key}>
              {t.mobileLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Переключение на ширину строки (учитывает сайдбар/aside): ≥820px помещаются все табы + кнопка, иначе — выпадашка */}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as ProjectTabKey)}
        className="@max-[820px]/tabrow:hidden"
      >
        <TabsList className="h-auto gap-1.5 bg-transparent p-0">
          {tabs.map((t) => (
            <TabsTrigger
              key={t.key}
              value={t.key}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-10 cursor-pointer rounded-[10px] border border-[#B1B1B1] bg-white px-4 py-1.5 text-sm font-normal text-[#454545] data-[state=active]:border-transparent data-[state=active]:shadow-none"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  )
}
