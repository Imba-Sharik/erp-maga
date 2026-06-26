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
      <div className="text-muted-foreground flex items-center gap-2 py-6 text-sm">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Загружаем лог…
      </div>
    )
  }

  if (isError) {
    return <p className="text-error text-sm">Не удалось загрузить лог действий.</p>
  }

  if (events.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Пока нет действий по проекту. Записи появятся по мере работы с проектом.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="divide-surface-divider border-border bg-card divide-y overflow-hidden rounded-[14px] border">
        {events.map((event) => (
          <ActivityEventItem key={event.id} event={event} />
        ))}
      </div>

      {hasNextPage ? (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="text-foreground-soft hover:bg-surface-muted inline-flex cursor-pointer items-center justify-center gap-2 self-center rounded-md px-3 py-2 text-xs transition-colors disabled:cursor-default disabled:opacity-60"
        >
          {isFetchingNextPage && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
          Показать ещё
        </button>
      ) : null}
    </div>
  )
}
