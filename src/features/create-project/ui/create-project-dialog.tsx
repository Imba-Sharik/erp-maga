import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useCurrentUser } from '@/entities/current-user'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { EVENT_TYPE_OPTIONS, getEventTypeLabelById } from '@/shared/constants/event-type-options'
import { HALL_OPTIONS, LOFT_OPTIONS } from '@/shared/constants/venue-options'
import { toIsoLocalDay } from '@/shared/lib/date/to-iso-local-day'
import { Button } from '@/shared/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { ClearableSelect } from '@/shared/ui/clearable-select'
import { Input } from '@/shared/ui/input'
import { buildMockApiProject } from '../lib/build-mock-api-project'
import { prependMockProjectToProjectsQueries } from '../lib/prepends-mock-to-projects-queries-cache'

const TRIGGER_CLASS =
  'h-10 w-full rounded-[10px] border-[#B1B1B1] bg-white data-placeholder:text-[#BCBCBC]'

const formSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Введите название проекта')
    .max(500, 'Не длиннее 500 символов'),
  eventType: z.string().min(1, 'Выберите тип мероприятия'),
  loft: z.string().min(1, 'Выберите лофт'),
  hall: z.string().min(1, 'Выберите зал'),
})

type FormValues = z.infer<typeof formSchema>

export interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()

  const previewDateLabel = useMemo(() => {
    if (!open) return ''
    return format(new Date(), 'd MMMM yyyy', { locale: ru })
  }, [open])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', eventType: '', loft: '', hall: '' },
  })

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const event_date = toIsoLocalDay(new Date())
      const eventTypeId = Number(values.eventType)
      return buildMockApiProject({
        event_name: values.title,
        event_type: eventTypeId,
        event_type_label: getEventTypeLabelById(values.eventType) ?? '',
        loft: values.loft,
        hall: values.hall,
        event_date,
        mag_manager: currentUser.fullName,
      })
    },
    onSuccess: (project) => {
      prependMockProjectToProjectsQueries(queryClient, project)
      onOpenChange(false)
      form.reset()
    },
  })

  function onSubmit(values: FormValues) {
    mutation.mutate(values)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) {
          form.reset()
          mutation.reset()
        }
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-[#1B1A17]">Новый проект</DialogTitle>
          <DialogDescription>
            {previewDateLabel
              ? `Дата мероприятия будет назначена: ${previewDateLabel}.`
              : null}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название проекта</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Например, Корпоратив Acme"
                      className="h-10 rounded-[10px] border-[#B1B1B1] bg-white placeholder:text-[#BCBCBC]"
                      autoComplete="off"
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
                  <FormLabel>Тип мероприятия</FormLabel>
                  <FormControl>
                    <ClearableSelect
                      placeholder="Выберите тип"
                      value={field.value || null}
                      options={EVENT_TYPE_OPTIONS.map((o) => ({
                        value: String(o.id),
                        label: o.label,
                      }))}
                      onChange={(v) => field.onChange(v ?? '')}
                      triggerClassName={TRIGGER_CLASS}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="loft"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Лофт</FormLabel>
                  <FormControl>
                    <ClearableSelect
                      placeholder="Выберите LOFT"
                      value={field.value || null}
                      options={LOFT_OPTIONS}
                      onChange={(v) => field.onChange(v ?? '')}
                      triggerClassName={TRIGGER_CLASS}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hall"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Зал</FormLabel>
                  <FormControl>
                    <ClearableSelect
                      placeholder="Выберите зал"
                      value={field.value || null}
                      options={HALL_OPTIONS}
                      onChange={(v) => field.onChange(v ?? '')}
                      triggerClassName={TRIGGER_CLASS}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-[10px]"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="rounded-[10px] bg-black text-white hover:bg-black/90"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Создание…' : 'Создать'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
