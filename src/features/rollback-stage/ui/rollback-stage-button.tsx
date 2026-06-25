import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'

import type { ProjectDetail } from '@/entities/project'
import { useUserRole } from '@/entities/user-role'
import { Button } from '@/shared/ui/button'

import { getPreviousStage } from '../lib/get-previous-stage'
import { ConfirmRollbackStageDialog } from './confirm-rollback-stage-dialog'

export interface RollbackStageButtonProps {
  project: ProjectDetail
  /** Проект открыт только для просмотра — гасит кнопку. */
  readOnly?: boolean
}

/**
 * Кнопка «Предыдущий этап» (ERP-208, только Руководитель) вместе с диалогом отката.
 * Самодостаточна: сама проверяет роль/readOnly/наличие предыдущего этапа и возвращает
 * `null`, если откат недоступен. Ставится в шапку текущего этапа (обычного и финансового).
 */
export function RollbackStageButton({ project, readOnly = false }: RollbackStageButtonProps) {
  const role = useUserRole()
  const [open, setOpen] = useState(false)
  const previousStage = getPreviousStage(project.stage)
  const canRollback = role === 'director' && !readOnly && previousStage !== null

  if (!canRollback) return null

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-[38px] rounded-[10px] border-[#B1B1B1] px-4 text-sm"
      >
        <ArrowLeft className="size-3.5" />
        Предыдущий этап
      </Button>
      <ConfirmRollbackStageDialog open={open} onOpenChange={setOpen} project={project} />
    </>
  )
}
