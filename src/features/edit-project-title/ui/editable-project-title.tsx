import { useState } from 'react'
import { Pencil } from 'lucide-react'

import {
  canEditProjectTitle,
  resolveProjectReadOnly,
  type ProjectDetail,
} from '@/entities/project'
import { useUserRole } from '@/entities/user-role'
import { cn } from '@/shared/lib/utils'

import { EditProjectTitleDialog } from './edit-project-title-dialog'

const TITLE_CLASS = 'text-foreground text-2xl font-bold'

/**
 * Название проекта в шапке карточки с кнопкой-карандашом (ERP-231). Карандаш виден
 * по правам `canEditProjectTitle` (руководитель/админ — всегда, ответственный менеджер —
 * на редактируемом проекте) и открывает модалку редактирования.
 */
export function EditableProjectTitle({ project }: { project: ProjectDetail }) {
  const role = useUserRole()
  const editable = canEditProjectTitle({ role, readOnly: resolveProjectReadOnly(project) })
  const [open, setOpen] = useState(false)

  if (!editable) {
    return <h1 className={TITLE_CLASS}>{project.title}</h1>
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <h1 className={cn(TITLE_CLASS, 'truncate')}>{project.title}</h1>
      <button
        type="button"
        aria-label="Изменить название"
        title="Изменить название"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-foreground hover:bg-surface-muted flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[10px] transition-colors"
      >
        <Pencil className="size-4" />
      </button>
      <EditProjectTitleDialog project={project} open={open} onOpenChange={setOpen} />
    </div>
  )
}
