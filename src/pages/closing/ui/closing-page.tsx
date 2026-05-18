import { useMemo } from 'react'

import { mapBackendProjects } from '@/entities/project'
import { toIsoLocalDay } from '@/shared/lib/date/to-iso-local-day'
import { ClosingBoard } from '@/widgets/closing-board'
import { useProjectsBoardQuery } from '@/widgets/projects-board'

export function ClosingPage() {
  const eventDateAfter = useMemo(() => toIsoLocalDay(new Date()), [])
  const query = useProjectsBoardQuery({ event_date_after: eventDateAfter })

  const projects = useMemo(() => {
    const raw = query.data?.pages.flatMap((p) => p.results) ?? []
    return mapBackendProjects(raw).sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
  }, [query.data])

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-bold text-[#1B1A17]">Закрытие</h1>
          <p className="max-w-[640px] text-sm text-[#ACACAC]">
            Проекты на этапах закрытия после проведения мероприятия.
          </p>
        </div>
      </header>

      {query.isError ? (
        <p className="text-sm text-red-600">Не удалось загрузить проекты.</p>
      ) : query.isLoading ? (
        <p className="text-sm text-[#ACACAC]">Загружаем проекты…</p>
      ) : (
        <ClosingBoard
          projects={projects}
          onLoadMore={() => query.fetchNextPage()}
          hasNextPage={query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
        />
      )}
    </div>
  )
}
