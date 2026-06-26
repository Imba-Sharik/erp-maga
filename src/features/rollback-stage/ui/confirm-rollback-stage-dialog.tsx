import { useState } from 'react'

import { ALL_STAGE_LABELS, type ProjectDetail } from '@/entities/project'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { DateField } from '@/shared/ui/date-field'

import { getPreviousStage } from '../lib/get-previous-stage'
import { getRollbackWarning } from '../lib/get-rollback-warning'
import { isEventDatePassed } from '../lib/is-event-date-passed'
import { useRollbackStage } from '../model/use-rollback-stage'

export interface ConfirmRollbackStageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: ProjectDetail
}

/**
 * Destructive-подтверждение отката на предыдущий этап (ERP-208). Свежий показ на
 * каждый клик — предупреждение о стирании данных появляется каждую итерацию.
 *
 * Спец-случай отката с `event_held` при прошедшей дате (ERP-209): добавляется поле
 * фактической даты мероприятия — редактируемое для ручных проектов и readonly для
 * PLUM; изменённое значение уходит в тело перехода.
 */
export function ConfirmRollbackStageDialog({
  open,
  onOpenChange,
  project,
}: ConfirmRollbackStageDialogProps) {
  const previousStage = getPreviousStage(project.stage)
  // Откат с event_held → ready_to_event требует event_date (бэк). Поле редактирования
  // показываем только при прошедшей дате (ERP-209); значение шлём для любого event_held.
  const isEventHeld = project.stage === 'event_held'
  // Бэк требует новую дату «сегодня или позже» при откате с event_held. Поле показываем,
  // когда дата прошла (ERP-209) ИЛИ её вовсе нет — иначе откат не сделать (вводить негде).
  const showEventDate = isEventHeld && (isEventDatePassed(project) || !project.date)
  const [eventDate, setEventDate] = useState(project.date ?? '')
  // Бэк требует дату «сегодня или позже» — пока поле пусто или дата прошедшая, гасим
  // подтверждение, чтобы не ловить ошибку валидации на сервере.
  const eventDateInvalid = isEventHeld && (!eventDate || isEventDatePassed({ date: eventDate }))

  const { submit, isPending, isError, errorMessage, reset } = useRollbackStage({
    onSuccess: () => onOpenChange(false),
  })

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    // Диалог смонтирован постоянно — при закрытии сбрасываем поле, чтобы отменённое
    // редактирование даты не «прилипло» к следующему открытию.
    if (!next) {
      setEventDate(project.date ?? '')
      reset()
    }
  }

  const handleConfirm = () => {
    submit({ project, eventDate: isEventHeld ? eventDate : undefined })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">
            Вернуть на предыдущий этап?
          </DialogTitle>
          <DialogDescription>
            {getRollbackWarning(project.stage)}
            {previousStage ? ` Проект вернётся на этап «${ALL_STAGE_LABELS[previousStage]}».` : ''}
          </DialogDescription>
        </DialogHeader>

        {showEventDate ? (
          <div className="flex flex-col gap-2">
            <span className="text-foreground-soft text-sm">Фактическая дата мероприятия</span>
            <DateField value={eventDate} onChange={setEventDate} />
            <p className="text-muted-foreground text-xs">
              Дата мероприятия прошла — укажите новую (сегодня или позже).
            </p>
          </div>
        ) : null}

        {isError && errorMessage ? (
          <p className="text-destructive text-sm">{errorMessage}</p>
        ) : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-[10px]"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-[10px]"
            onClick={handleConfirm}
            disabled={isPending || !previousStage || eventDateInvalid}
          >
            {isPending ? 'Возврат…' : showEventDate ? 'Сохранить и вернуть' : 'Вернуть назад'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
