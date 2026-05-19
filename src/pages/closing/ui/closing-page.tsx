import { useMemo } from 'react'

import { toIsoLocalDay } from '@/shared/lib/date/to-iso-local-day'
import { ClosingBoard } from '@/widgets/closing-board'

export function ClosingPage() {
  const listDateParams = useMemo(() => ({ event_date_after: toIsoLocalDay(new Date()) }), [])

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

      <ClosingBoard listDateParams={listDateParams} />
    </div>
  )
}
