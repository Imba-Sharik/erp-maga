import { Loader2 } from 'lucide-react'

import { ActivityEventItem } from '@/entities/project-activity'

import { useProjectAuditLogQuery } from '../lib/use-project-audit-log-query'

interface ProjectActivityLogProps {
  projectId: number
  enabled?: boolean
}

export function ProjectActivityLog({ projectId, enabled = true }: ProjectActivityLogProps) {
  const { events, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useProjectAuditLogQuery({ projectId, enabled })

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-[#ACACAC]">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Загружаем лог…
      </div>
    )
  }

  if (isError) {
    return <p className="text-sm text-red-600">Не удалось загрузить лог действий.</p>
  }

  if (events.length === 0) {
    return (
      <p className="text-sm text-[#ACACAC]">
        Пока нет действий по проекту. Записи появятся по мере работы с проектом.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="divide-y divide-[#F0F0F0] overflow-hidden rounded-[14px] border border-[#E9E6DD] bg-white">
        {events.map((event) => (
          <ActivityEventItem key={event.id} event={event} />
        ))}
      </div>

      {hasNextPage ? (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="inline-flex cursor-pointer items-center justify-center gap-2 self-center rounded-md px-3 py-2 text-xs text-[#454545] transition-colors hover:bg-[#F4F2EC] disabled:cursor-default disabled:opacity-60"
        >
          {isFetchingNextPage && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
          Показать ещё
        </button>
      ) : null}
    </div>
  )
}
