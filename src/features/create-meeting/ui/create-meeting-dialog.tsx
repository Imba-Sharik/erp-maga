import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { format, isValid, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

import {
  meetingFormSchema,
  type ListMeetingsParams,
  type MeetingFormValues,
} from '@/entities/meeting'
import { useUserRole } from '@/entities/user-role'
import { LoftHallAssignmentFields, useLoftHallAssignment } from '@/entities/venue'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { EventTypeSelect } from '@/shared/ui/event-type-select'
import { Input } from '@/shared/ui/input'
import { RequiredLabel } from '@/shared/ui/required-label'
import { Textarea } from '@/shared/ui/textarea'
import { TimeField } from '@/shared/ui/time-field'

import { useCreateMeeting } from '../model/use-create-meeting'

const EMPTY_VALUES: MeetingFormValues = {
  title: '',
  eventType: '',
  comment: '',
  time: '',
  lofts: [],
  halls: [],
}

const TRIGGER_CLASS = 'h-10 min-w-0 w-full rounded-[10px] border-border-strong bg-card'

function formatDayLabel(iso: string): string | null {
  const d = parseISO(iso)
  return isValid(d) ? format(d, 'd MMMM yyyy', { locale: ru }) : null
}

export interface CreateMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: string
  managerId: number
  queryParams: ListMeetingsParams
}

export function CreateMeetingDialog({
  open,
  onOpenChange,
  date,
  managerId,
  queryParams,
}: CreateMeetingDialogProps) {
  const role = useUserRole()
  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: EMPTY_VALUES,
    mode: 'onSubmit',
  })

  // Менеджеру доступны только закреплённые залы; руководителю — весь каталог (ERP-183).
  const assignment = useLoftHallAssignment(form, { assigned: role === 'manager' })

  const {
    create,
    isPending,
    isError,
    errorMessage,
    reset: resetMutation,
  } = useCreateMeeting({
    queryParams,
    managerId,
    date,
    onSuccess: () => {
      onOpenChange(false)
      form.reset(EMPTY_VALUES)
    },
  })

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) {
      form.reset(EMPTY_VALUES)
      resetMutation()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">Добавить встречу</DialogTitle>
          {formatDayLabel(date) ? (
            <DialogDescription>На {formatDayLabel(date)}</DialogDescription>
          ) : null}
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => create(values))}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <RequiredLabel label="Название встречи" required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border-border-strong h-10 rounded-[10px]"
                      placeholder="Введите название"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <RequiredLabel label="Тип события" required />
                  </FormLabel>
                  <FormControl>
                    <EventTypeSelect
                      value={field.value}
                      onChange={field.onChange}
                      triggerClassName={TRIGGER_CLASS}
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
                  <FormLabel>
                    <RequiredLabel label="Комментарий" required />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="border-border-strong min-h-20 rounded-[10px]"
                      placeholder="Введите комментарий"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoftHallAssignmentFields
              control={form.control}
              assignment={assignment}
              triggerClassName={TRIGGER_CLASS}
              layout="inline"
              alwaysShowHalls
              required
              loftLabel="Лофт"
              hallLabel="Зал"
            />
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <RequiredLabel label="Время встречи" required />
                  </FormLabel>
                  <FormControl>
                    <TimeField value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-[10px]"
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
