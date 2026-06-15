import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { format, isValid, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

import { reminderFormSchema, type Reminder, type ReminderFormValues } from '@/entities/reminder'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Form } from '@/shared/ui/form'

import { ReminderFormFields } from './reminder-form-fields'

export interface ReminderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Дата по умолчанию (yyyy-MM-dd) для создания */
  defaultDate?: string
  /** Редактируемое напоминание; null/undefined — режим создания */
  reminder?: Reminder | null
  isPending?: boolean
  errorMessage?: string | null
  /** Скрыть поле даты (день берётся из контекста, напр. выбранный день календаря). */
  hideDate?: boolean
  onSubmit: (values: ReminderFormValues) => void
}

function makeDefaults(defaultDate: string): ReminderFormValues {
  return { title: '', comment: '', date: defaultDate, time: '', notifyTelegram: false }
}

function formatDayLabel(iso: string): string | null {
  const d = parseISO(iso)
  return isValid(d) ? format(d, 'd MMMM yyyy', { locale: ru }) : null
}

/**
 * Презентационная модалка напоминания (создание/редактирование).
 * Персистенс инжектится через `onSubmit` — календарь шлёт API-мутацию,
 * проектный таб пишет в локальный стор.
 */
export function ReminderFormDialog({
  open,
  onOpenChange,
  defaultDate = '',
  reminder = null,
  isPending = false,
  errorMessage = null,
  hideDate = false,
  onSubmit,
}: ReminderFormDialogProps) {
  const isEdit = reminder !== null
  // Когда поле даты скрыто (добавление из календаря) — показываем выбранный день в шапке.
  const dayLabel = hideDate ? formatDayLabel(reminder?.date ?? defaultDate) : null
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: makeDefaults(defaultDate),
    mode: 'onSubmit',
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      reminder
        ? {
            title: reminder.title,
            comment: reminder.comment,
            date: reminder.date,
            time: reminder.time,
            notifyTelegram: reminder.notifyTelegram,
          }
        : makeDefaults(defaultDate),
    )
  }, [open, reminder, defaultDate, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-[#1B1A17]">
            {isEdit ? 'Редактировать напоминание' : 'Добавить напоминание'}
          </DialogTitle>
          {dayLabel ? <DialogDescription>На {dayLabel}</DialogDescription> : null}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <ReminderFormFields control={form.control} hideDate={hideDate} />

            {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-[10px]"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="rounded-[10px] bg-black text-white hover:bg-black/90"
                disabled={isPending}
              >
                {isPending ? 'Сохранение…' : 'Сохранить'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
