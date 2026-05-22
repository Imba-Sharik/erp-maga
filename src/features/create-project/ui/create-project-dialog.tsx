import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useCurrentUser } from '@/entities/current-user'
import { DEFAULT_PROJECTS_BACK_ORIGIN } from '@/entities/project'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { useVenueCatalog } from '@/entities/venue'
import { EVENT_TYPE_OPTIONS } from '@/shared/constants/event-type-options'
import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { ClearableSelect } from '@/shared/ui/clearable-select'
import { Input } from '@/shared/ui/input'

import type { CreateProjectFormValues } from '../lib/create-project-form-values'
import { useCreateProject } from '../model/use-create-project'

const TRIGGER_CLASS =
  'h-10 w-full rounded-[10px] border-[#B1B1B1] bg-white data-placeholder:text-[#BCBCBC]'

const formSchema = z.object({
  title: z.string().trim().min(1, 'Введите название проекта').max(500, 'Не длиннее 500 символов'),
  eventType: z.string().min(1, 'Выберите тип мероприятия'),
  loft: z.string().min(1, 'Выберите лофт'),
  hall: z.string().min(1, 'Выберите зал'),
}) satisfies z.ZodType<CreateProjectFormValues>

export interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const {
    hallOptions,
    loftOptions,
    isLoading: isVenueCatalogLoading,
    isError: isVenueCatalogError,
  } = useVenueCatalog()
  const selectDisabled = isVenueCatalogLoading || isVenueCatalogError

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', eventType: '', loft: '', hall: '' },
  })

  const {
    create,
    isPending,
    isError,
    errorMessage,
    reset: resetMutation,
  } = useCreateProject({
    magManager: currentUser.fullName,
    onCreated: (project) => {
      onOpenChange(false)
      form.reset()
      navigate(`/projects/${project.id}`, { state: DEFAULT_PROJECTS_BACK_ORIGIN })
    },
  })

  const previewDateLabel = useMemo(() => {
    if (!open) return ''
    return format(new Date(), 'd MMMM yyyy', { locale: ru })
  }, [open])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) {
          form.reset()
          resetMutation()
        }
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-[#1B1A17]">Новый проект</DialogTitle>
          <DialogDescription>
            {previewDateLabel ? `Дата мероприятия будет назначена: ${previewDateLabel}.` : null}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(create)} className="flex flex-col gap-4">
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
                      options={loftOptions}
                      onChange={(v) => field.onChange(v ?? '')}
                      triggerClassName={TRIGGER_CLASS}
                      disabled={selectDisabled}
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
                      options={hallOptions}
                      onChange={(v) => field.onChange(v ?? '')}
                      triggerClassName={TRIGGER_CLASS}
                      disabled={selectDisabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isError && errorMessage ? (
              <p className="text-destructive text-sm" role="alert">
                {errorMessage}
              </p>
            ) : null}
            <DialogFooter className="gap-2 sm:gap-2">
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
                {isPending ? 'Создание…' : 'Создать'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
