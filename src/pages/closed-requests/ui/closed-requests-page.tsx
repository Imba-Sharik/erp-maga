import { RequestsTable } from '@/widgets/requests-table'

export function ClosedRequestsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-foreground font-bold">Закрытые запросы</h1>
          <p className="text-muted-foreground hidden max-w-[640px] text-sm md:block">
            Проекты с подтверждёнными документами.
          </p>
        </div>
      </header>

      <RequestsTable variant="closed" />
    </div>
  )
}
