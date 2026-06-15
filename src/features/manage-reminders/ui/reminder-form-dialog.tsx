import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { ExternalLink } from 'lucide-react'

import {
  reminderActions,
  reminderFormSchema,
  type Reminder,
  type ReminderFormValues,
} from '@/entities/reminder'
import { useRequestTelegramLink, useTelegramAccountStatus } from '@/features/link-telegram'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { RequiredLabel } from '@/shared/ui/required-label'
import { Textarea } from '@/shared/ui/textarea'
import { DateField } from '@/shared/ui/date-field'
import { TimeField } from '@/shared/ui/time-field'
import { ToggleSwitch } from '@/shared/ui/toggle-switch'

export interface ReminderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Менеджер-владелец создаваемого напоминания */
  managerId: number
  /** Привязка к проекту: null — из календаря встреч */
  projectId: number | null
  /** Дата по умолчанию (yyyy-MM-dd) для создания */
  defaultDate?: string
  /** Редактируемое напоминание; null — режим создания */
  reminder?: Reminder | null
}

function makeDefaults(defaultDate: string): ReminderFormValues {
  return { title: '', comment: '', date: defaultDate, time: '', notifyTelegram: false }
}

export function ReminderFormDialog({
  open,
  onOpenChange,
  managerId,
  projectId,
  defaultDate = '',
  reminder = null,
}: ReminderFormDialogProps) {
  const isEdit = reminder !== null
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: makeDefaults(defaultDate),
    mode: 'onSubmit',
  })

  const telegram = useTelegramAccountStatus()
  const { requestLink, isPending: linkPending } = useRequestTelegramLink()
  const notifyTelegram = useWatch({ control: form.control, name: 'notifyTelegram' })

  // Заполняем форму при открытии: данными напоминания (edit) или дефолтами (create).
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

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
  }

  const onSubmit = (values: ReminderFormValues) => {
    if (reminder) {
      reminderActions.update(reminder.id, {
        title: values.title,
        comment: values.comment,
        date: values.date,
        time: values.time,
        notifyTelegram: values.notifyTelegram,
      })
    } else {
      reminderActions.add({
        title: values.title,
        comment: values.comment,
        date: values.date,
        time: values.time,
        notifyTelegram: values.notifyTelegram,
        managerId,
        projectId,
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-[#1B1A17]">
            {isEdit ? 'Редактировать напоминание' : 'Добавить напоминание'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <RequiredLabel label="Заголовок" required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-10 rounded-[10px] border-[#B1B1B1]"
                      placeholder="Введите заголовок"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Комментарий</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-20 rounded-[10px] border-[#B1B1B1]"
                      placeholder="Введите комментарий"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <RequiredLabel label="Дата напоминания" required />
                    </FormLabel>
                    <FormControl>
                      <DateField value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <RequiredLabel label="Время напоминания" required />
                    </FormLabel>
                    <FormControl>
                      <TimeField value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notifyTelegram"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <ToggleSwitch
                    label="Напомнить в Telegram"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                  <p className="text-xs text-[#ACACAC]">
                    Уведомление в любом случае придёт в ЕРП. Telegram — дополнительно.
                  </p>
                </FormItem>
              )}
            />

            {notifyTelegram && !telegram.isLoading && !telegram.isLinked ? (
              <div className="flex flex-col gap-2 rounded-[10px] border border-[#E4D3B7] bg-[#FBF4E8] px-3 py-2.5">
                <p className="text-sm text-[#AA8540]">
                  Telegram-бот не привязан — уведомление в Telegram не придёт.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 w-fit rounded-[10px] border-[#E4D3B7] bg-white text-[#AA8540] hover:bg-[#FBF4E8]"
                  disabled={linkPending}
                  onClick={() => void requestLink()}
                >
                  <ExternalLink className="size-4" />
                  {linkPending ? 'Получение ссылки…' : 'Привязать Telegram'}
                </Button>
              </div>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-[10px]"
                onClick={() => handleOpenChange(false)}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="rounded-[10px] bg-black text-white hover:bg-black/90"
              >
                Сохранить
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
