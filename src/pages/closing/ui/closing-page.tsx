import { useMemo, useState } from 'react'

import type { Project } from '@/entities/project'
import { useUserRole } from '@/entities/user-role'
import { ConfirmDeleteProjectDialog } from '@/features/delete-project'
import { PROJECTS_LIST_DEFAULT_ORDERING } from '@/shared/constants'
import { ClosingBoard } from '@/widgets/closing-board'

export function ClosingPage() {
  const role = useUserRole()
  const isAdmin = role === 'admin'
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [archiveMode, setArchiveMode] = useState(false)

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
          <h1 className="font-heading text-foreground font-bold">
            {archiveMode ? 'Архив проектов' : 'Закрытие'}
          </h1>
          <p className="text-muted-foreground hidden max-w-[640px] text-sm md:block">
            {archiveMode
              ? isAdmin
                ? 'Архив завершённых проектов без возможности смены ответственного менеджера.'
                : 'Завершённые и архивированные проекты.'
              : 'Проекты на этапах закрытия после проведения мероприятия.'}
          </p>
        </div>
      </header>

      <ClosingBoard
        listDateParams={listDateParams}
        canChangeManager={!isAdmin}
        onDeleteProject={isAdmin ? setDeleteTarget : undefined}
        onArchiveModeChange={setArchiveMode}
      />

      {isAdmin && (
        <ConfirmDeleteProjectDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null)
          }}
          project={deleteTarget}
        />
      )}
    </div>
  )
}
