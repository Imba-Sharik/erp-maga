import { useMemo, useState } from 'react'

import type { Project } from '@/entities/project'
import { ConfirmDeleteProjectDialog } from '@/features/delete-project'
import { PROJECTS_LIST_DEFAULT_ORDERING } from '@/shared/constants/projects-list-ordering'
import { toIsoLocalDay } from '@/shared/lib/date/to-iso-local-day'
import { ClosingBoard } from '@/widgets/closing-board'

const CLOSED_PROJECTS_BACK = {
  to: '/closed-projects',
  label: 'Закрытые проекты',
} as const

export function ClosedProjectsPage() {
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [archiveMode, setArchiveMode] = useState(false)

  const listDateParams = useMemo(
    () => ({
      event_date_after: toIsoLocalDay(new Date()),
      ordering: PROJECTS_LIST_DEFAULT_ORDERING,
    }),
    [],
  )

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-bold text-[#1B1A17]">
            {archiveMode ? 'Архив проектов' : 'Закрытие'}
          </h1>
          <p className="max-w-[640px] text-sm text-[#ACACAC]">
            {archiveMode
              ? 'Архив завершённых проектов без возможности смены ответственного менеджера.'
              : 'Проекты на этапах закрытия после проведения мероприятия.'}
          </p>
        </div>
      </header>

      <ClosingBoard
        listDateParams={listDateParams}
        backOrigin={CLOSED_PROJECTS_BACK}
        canChangeManager={false}
        onDeleteProject={setDeleteTarget}
        onArchiveModeChange={setArchiveMode}
      />

      <ConfirmDeleteProjectDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        projectName={deleteTarget?.title ?? ''}
      />
    </div>
  )
}
