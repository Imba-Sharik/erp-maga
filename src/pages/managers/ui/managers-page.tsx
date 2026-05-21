import { useState } from 'react'

import { ManagersToolbar } from './managers-toolbar'

export function ManagersPage() {
  const [search, setSearch] = useState('')
  const [hall, setHall] = useState<string | null>(null)
  const [loft, setLoft] = useState<string | null>(null)

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-bold text-[#1B1A17]">Управление менеджерами</h1>
          <p className="max-w-[640px] text-sm text-[#ACACAC]">
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
    </div>
  )
}
