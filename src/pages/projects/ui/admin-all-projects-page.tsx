import { useState } from 'react'

import { ConfirmDeleteProjectDialog, DeleteProjectButton } from '@/features/delete-project'
import type { Project } from '@/entities/project'
import { ProjectsTable } from '@/widgets/projects-table'

export function AdminAllProjectsPage() {
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  return (
    <div className="@container flex h-full min-h-0 flex-1 flex-col gap-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-bold text-[#1B1A17]">Все проекты</h1>
          <p className="max-w-[640px] text-sm text-[#ACACAC]">
            Список всех проектов MAG. Вывод в «Вне контура MAG» недоступен для администратора.
          </p>
        </div>
      </header>

      <ProjectsTable
        managerEditable={false}
        renderRowAction={(project) => (
          <DeleteProjectButton onRequestDelete={() => setDeleteTarget(project)} />
        )}
      />

      <ConfirmDeleteProjectDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        project={deleteTarget}
      />
    </div>
  )
}
