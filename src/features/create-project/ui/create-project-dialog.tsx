import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useCurrentUser } from '@/entities/current-user'
import { DEFAULT_PROJECTS_BACK_ORIGIN } from '@/entities/project'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { useVenueCatalog } from '@/entities/venue'
import { EVENT_TYPE_OPTIONS } from '@/shared/constants/event-type-options'
import { toIsoLocalDay } from '@/shared/lib/date/to-iso-local-day'
import { Button } from '@/shared/ui/button'
import { DateField } from '@/shared/ui/date-field'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { ClearableSelect } from '@/shared/ui/clearable-select'
import { MultiSelect } from '@/shared/ui/multi-select'
import { Input } from '@/shared/ui/input'

import type { CreateProjectFormValues } from '../lib/create-project-form-values'
import { useCreateProject } from '../model/use-create-project'

const TRIGGER_CLASS =
  'h-10 w-full rounded-[10px] border-[#B1B1B1] bg-white data-placeholder:text-[#BCBCBC]'

const formSchema = z.object({
  title: z.string().trim().min(1, 'Введите название проекта').max(500, 'Не длиннее 500 символов'),
  eventType: z.string().min(1, 'Выберите тип мероприятия'),
  eventDate: z.string().min(1, 'Выберите дату мероприятия'),
  lofts: z.array(z.string()).min(1, 'Выберите хотя бы один лофт'),
  halls: z.array(z.string()).min(1, 'Выберите хотя бы один зал'),
}) satisfies z.ZodType<CreateProjectFormValues>

function getDefaultValues(): CreateProjectFormValues {
  return { title: '', eventType: '', eventDate: toIsoLocalDay(new Date()), lofts: [], halls: [] }
}

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
    defaultValues: getDefaultValues(),
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
      form.reset(getDefaultValues())
      navigate(`/projects/${project.id}`, { state: DEFAULT_PROJECTS_BACK_ORIGIN })
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) {
          form.reset(getDefaultValues())
          resetMutation()
        }
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader className="text-left">
          <DialogTitle className="font-heading text-[#1B1A17]">Новый проект</DialogTitle>
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
            <div className="grid grid-cols-2 gap-3">
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
                name="eventDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дата мероприятия</FormLabel>
                    <FormControl>
                      <DateField
                        value={field.value}
                        onChange={field.onChange}
                        className="h-10 rounded-[10px] border-[#B1B1B1] bg-white px-3 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="lofts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Лофты</FormLabel>
                  <FormControl>
                    <MultiSelect
                      placeholder="Выберите лофты"
                      values={field.value}
                      options={loftOptions}
                      onChange={field.onChange}
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
              name="halls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Залы</FormLabel>
                  <FormControl>
                    <MultiSelect
                      placeholder="Выберите залы"
                      values={field.value}
                      options={hallOptions}
                      onChange={field.onChange}
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
                {isPending ? 'Создание…' : 'Создать'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
