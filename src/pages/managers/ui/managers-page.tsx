import { useFilterParams } from '@/shared/hooks'
import { ManagersTable } from '@/widgets/managers-table'

import { ManagersToolbar } from './managers-toolbar'

export function ManagersPage() {
  // Поиск и фильтры зал/LOFT живут в URL — переживают перезагрузку (F5).
  const { getString, set } = useFilterParams()
  const search = getString('q') ?? ''
  const hall = getString('hall')
  const loft = getString('loft')
  const setSearch = (value: string) => set('q', value)
  const setHall = (value: string | null) => set('hall', value)
  const setLoft = (value: string | null) => set('loft', value)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-foreground font-bold">Управление менеджерами</h1>
          <p className="text-muted-foreground hidden max-w-[640px] text-sm md:block">
            Привязка менеджеров к залам и LOFT&apos;ам
          </p>
        </div>
      </header>

      <ManagersToolbar
        search={search}
        hall={hall}
        loft={loft}
        onChangeSearch={setSearch}
        onChangeHall={setHall}
        onChangeLoft={setLoft}
      />

      <ManagersTable search={search} hall={hall} loft={loft} />
    </div>
  )
}
