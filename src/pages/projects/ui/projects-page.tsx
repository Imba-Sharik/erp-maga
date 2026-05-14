import { useMemo } from 'react'
import { Plus } from 'lucide-react'

import { mapBackendProjects } from '@/entities/project'
import { toIsoLocalDay } from '@/shared/lib/date/to-iso-local-day'
import { Button } from '@/shared/ui/button'
import { ProjectsBoard, useProjectsBoardQuery } from '@/widgets/projects-board'

export function ProjectsPage() {
  const eventDateAfter = useMemo(() => toIsoLocalDay(new Date()), [])
  const query = useProjectsBoardQuery({ event_date_after: eventDateAfter })

  const projects = useMemo(() => {
    const raw = query.data?.pages.flatMap((p) => p.results) ?? []
    const mapped = mapBackendProjects(raw)
    return mapped.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
  }, [query.data])

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[22px] font-bold text-[#1B1A17]">Проекты</h1>
          <p className="max-w-[640px] text-sm text-[#ACACAC]">
            Все проекты, проходящие через MAG. Проекты «Вне контура MAG» см. в отдельном разделе.
          </p>
        </div>
        <Button className="h-10 rounded-[10px] bg-black px-4 text-white hover:bg-black/90">
          <Plus className="size-4" />
          Добавить проект
        </Button>
      </header>

      {query.isError ? (
        <p className="text-sm text-red-600">Не удалось загрузить проекты.</p>
      ) : query.isLoading ? (
        <p className="text-sm text-[#ACACAC]">Загружаем проекты…</p>
      ) : (
        <ProjectsBoard
          projects={projects}
          onLoadMore={() => query.fetchNextPage()}
          hasNextPage={query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
        />
      )}
    </div>
  )
}
