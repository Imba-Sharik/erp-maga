import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import {
  meetingFormSchema,
  type ListMeetingsParams,
  type Meeting,
  type MeetingFormValues,
} from '@/entities/meeting'
import { LoftHallAssignmentFields, useLoftHallAssignment } from '@/entities/venue'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { RequiredLabel } from '@/shared/ui/required-label'
import { Textarea } from '@/shared/ui/textarea'
import { TimeField } from '@/shared/ui/time-field'

import { useUpdateMeeting } from '../model/use-update-meeting'

const EMPTY_VALUES: MeetingFormValues = { title: '', comment: '', time: '', lofts: [], halls: [] }

const TRIGGER_CLASS = 'h-10 w-full rounded-[10px] border-[#B1B1B1] bg-white'

export interface EditMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting: Meeting | null
  queryParams: ListMeetingsParams
}

export function EditMeetingDialog({
  open,
  onOpenChange,
  meeting,
  queryParams,
}: EditMeetingDialogProps) {
  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: EMPTY_VALUES,
    mode: 'onSubmit',
  })

  useEffect(() => {
    if (meeting && open) {
      const hallIds = meeting.halls.map((hall) => String(hall.hallId))
      const loftIds = [
        ...new Set(
          meeting.halls.flatMap((hall) => (hall.loftId == null ? [] : [String(hall.loftId)])),
        ),
      ]
      form.reset({
        title: meeting.title,
        comment: meeting.comment,
        time: meeting.time,
        lofts: loftIds,
        halls: hallIds,
      })
    }
  }, [meeting, open, form])

  const assignment = useLoftHallAssignment(form, { assigned: true })

  const {
    update,
    isPending,
    isError,
    errorMessage,
    reset: resetMutation,
  } = useUpdateMeeting({
    queryParams,
    meeting,
    onSuccess: () => onOpenChange(false),
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
          <DialogTitle className="font-heading text-[#1B1A17]">Редактировать встречу</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => update(values))}
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
                      className="h-10 rounded-[10px] border-[#B1B1B1]"
                      placeholder="Введите название"
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
                      className="min-h-20 rounded-[10px] border-[#B1B1B1]"
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
                className="rounded-[10px] bg-black text-white hover:bg-black/90"
                disabled={isPending || !meeting}
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
