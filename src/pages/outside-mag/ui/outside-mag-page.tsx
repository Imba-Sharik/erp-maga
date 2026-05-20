import { useMemo } from 'react'

import { PROJECTS_LIST_DEFAULT_ORDERING } from '@/shared/constants/projects-list-ordering'
import { OutsideMagBoard } from '@/widgets/outside-mag-board'

export function OutsideMagPage() {
  const listDateParams = useMemo(
    () => ({
      ordering: PROJECTS_LIST_DEFAULT_ORDERING,
    }),
    [],
  )

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-bold text-[#1B1A17]">Вне контура MAG</h1>
          <p className="max-w-[640px] text-sm text-[#ACACAC]">
            Проекты, выведенные из контура MAG. Их можно вернуть в основную воронку из карточки
            проекта.
          </p>
        </div>
      </header>

      <OutsideMagBoard listDateParams={listDateParams} />
    </div>
  )
}
