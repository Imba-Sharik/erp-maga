import { useMemo } from 'react'

import { PROJECTS_LIST_DEFAULT_ORDERING } from '@/shared/constants'
import { OutsideMagBoard } from '@/widgets/outside-mag-board'

export function OutsideMagPage() {
  const listDateParams = useMemo(
    () => ({
      ordering: PROJECTS_LIST_DEFAULT_ORDERING,
    }),
    [],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-foreground font-bold">Вне контура MAG</h1>
          <p className="text-muted-foreground hidden max-w-[640px] text-sm md:block">
            Проекты, перемещённые в воронку “Вне контура”
          </p>
        </div>
      </header>

      <OutsideMagBoard listDateParams={listDateParams} />
    </div>
  )
}
