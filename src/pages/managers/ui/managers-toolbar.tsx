import { Search } from 'lucide-react'

import { useLoftHallFilter, VenueFilterSelect } from '@/entities/venue'
import { Input } from '@/shared/ui/input'

const TRIGGER_CLASS =
  'h-10! min-w-0 flex-1 rounded-[10px] border-border-strong bg-card data-placeholder:text-disabled-foreground lg:w-41.5 lg:flex-none'

interface ManagersToolbarProps {
  search: string
  hall: string | null
  loft: string | null
  onChangeSearch: (value: string) => void
  onChangeHall: (value: string | null) => void
  onChangeLoft: (value: string | null) => void
}

export function ManagersToolbar({
  search,
  hall,
  loft,
  onChangeSearch,
  onChangeHall,
  onChangeLoft,
}: ManagersToolbarProps) {
  const { loftOptions, hallOptions, selectDisabled, shouldResetHall } = useLoftHallFilter(loft)
  const handleChangeLoft = (next: string | null) => {
    onChangeLoft(next)
    if (shouldResetHall(next, hall)) onChangeHall(null)
  }

  return (
    <div className="flex shrink-0 flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
      <div className="relative w-full md:w-75">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder="Поиск менеджеров"
          value={search}
          onChange={(e) => onChangeSearch(e.target.value)}
          className="border-border-strong placeholder:text-muted-foreground bg-card h-10 rounded-[10px] pl-9"
        />
      </div>

      <div className="flex flex-1 flex-wrap items-center gap-2.5 md:flex-none">
        <VenueFilterSelect
          filter="hall"
          value={hall}
          options={hallOptions}
          onChange={onChangeHall}
          triggerClassName={TRIGGER_CLASS}
          disabled={selectDisabled}
        />
        <VenueFilterSelect
          filter="loft"
          value={loft}
          options={loftOptions}
          onChange={handleChangeLoft}
          triggerClassName={TRIGGER_CLASS}
          disabled={selectDisabled}
        />
      </div>
    </div>
  )
}
