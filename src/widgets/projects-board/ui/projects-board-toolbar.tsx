import { useMemo } from 'react'
import { Search } from 'lucide-react'
import { PlumEventStatusFilterSelect } from '@/entities/project'
import { hallsToSelectOptions, useVenueCatalog, VenueFilterSelect } from '@/entities/venue'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

const CITY_OPTIONS = ['Москва', 'Санкт-Петербург', 'Казань']

const TRIGGER_CLASS =
  'h-10! w-full min-w-[calc(50%-4px)] flex-1 rounded-[10px] border-[#B1B1B1] bg-white text-xs data-placeholder:text-[#BCBCBC] @4xl:w-41.5 @4xl:min-w-0 @4xl:flex-none @4xl:text-sm'

interface ProjectsBoardToolbarProps {
  search: string
  city: string | null
  hall: string | null
  loft: string | null
  plumEventStatus: string | null
  onChangeSearch: (value: string) => void
  onChangeCity: (value: string | null) => void
  onChangeHall: (value: string | null) => void
  onChangeLoft: (value: string | null) => void
  onChangePlumEventStatus: (value: string | null) => void
  onAddProject?: () => void
  /** Селекты рядом с поиском (слева), без растягивания вправо */
  filtersAlign?: 'start' | 'spread'
}

export function ProjectsBoardToolbar({
  search,
  city,
  hall,
  loft,
  plumEventStatus,
  onChangeSearch,
  onChangeCity,
  onChangeHall,
  onChangeLoft,
  onChangePlumEventStatus,
  onAddProject,
  filtersAlign = 'spread',
}: ProjectsBoardToolbarProps) {
  const { halls, lofts, hallOptions, loftOptions, isLoading, isError } = useVenueCatalog()
  const selectDisabled = isLoading || isError
  const filtersAtStart = filtersAlign === 'start'

  // Залы выбранного лофта: матчим по loft.id (FK), c запасным вариантом по loft.name.
  const hallsOfSelectedLoft = useMemo(() => {
    if (!loft) return null
    const target = lofts.find((l) => l.name === loft)
    return halls.filter(
      (h) => (target != null && h.loft?.id === target.id) || h.loft?.name === loft,
    )
  }, [loft, halls, lofts])

  // Выбран конкретный LOFT — в фильтре залов оставляем только его залы.
  const hallOptionsForLoft = useMemo(
    () => (hallsOfSelectedLoft ? hallsToSelectOptions(hallsOfSelectedLoft) : hallOptions),
    [hallsOfSelectedLoft, hallOptions],
  )

  // Смена LOFT, при которой выбранный зал ему не принадлежит, — сбрасываем зал.
  const handleChangeLoft = (next: string | null) => {
    onChangeLoft(next)
    if (!next || !hall) return
    const target = lofts.find((l) => l.name === next)
    const belongs = halls.some(
      (h) => h.name === hall && ((target != null && h.loft?.id === target.id) || h.loft?.name === next),
    )
    if (!belongs) onChangeHall(null)
  }

  return (
    <div
      className={
        filtersAtStart
          ? 'flex min-w-0 shrink-0 flex-col gap-3 @4xl:flex-row @4xl:items-center @4xl:justify-start @4xl:gap-4'
          : 'flex min-w-0 shrink-0 flex-col gap-3 @4xl:flex-row @4xl:items-center @4xl:justify-between @4xl:gap-4'
      }
    >
      <div className="flex items-center gap-2 @4xl:w-75">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-[#ACACAC] @4xl:left-3 @4xl:size-4" />
          <Input
            type="search"
            placeholder="Поиск проектов"
            value={search}
            onChange={(e) => onChangeSearch(e.target.value)}
            className="h-10 rounded-[10px] border-[#B1B1B1] bg-white pr-1.5 pl-7 text-xs placeholder:text-xs placeholder:text-[#ACACAC] @4xl:pr-3 @4xl:pl-9 @4xl:text-sm @4xl:placeholder:text-sm"
          />
        </div>
        {onAddProject && (
          <Button
            type="button"
            onClick={onAddProject}
            aria-label="Добавить проект"
            className="size-10 shrink-0 rounded-[10px] bg-black p-0 text-lg leading-none text-white hover:bg-black/90 @4xl:hidden"
          >
            +
          </Button>
        )}
      </div>

      <div
        className={
          filtersAtStart
            ? 'flex min-w-0 flex-wrap items-center gap-2 @4xl:gap-2.5'
            : 'flex min-w-0 flex-1 flex-wrap items-center gap-2 @4xl:flex-none @4xl:gap-2.5'
        }
      >
        <VenueFilterSelect
          filter="city"
          value={city}
          options={CITY_OPTIONS}
          onChange={onChangeCity}
          triggerClassName={TRIGGER_CLASS}
        />
        <VenueFilterSelect
          filter="hall"
          value={hall}
          options={hallOptionsForLoft}
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
        <PlumEventStatusFilterSelect
          value={plumEventStatus}
          onChange={onChangePlumEventStatus}
          triggerClassName={TRIGGER_CLASS}
        />
      </div>
    </div>
  )
}
