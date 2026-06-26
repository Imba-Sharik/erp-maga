import { zodResolver } from '@hookform/resolvers/zod'
import type { Control } from 'react-hook-form'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch, useFormContext } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useCurrentUser } from '@/entities/current-user'
import { useManagersDirectory, MANAGER_HALL_ASSIGNMENT_HINT } from '@/entities/manager'
import { DEFAULT_PROJECTS_BACK_ORIGIN } from '@/entities/project'
import { useUserRole } from '@/entities/user-role'
import { LoftHallAssignmentFields, useLoftHallAssignment, useVenueCatalog } from '@/entities/venue'
import { EVENT_TYPE_OPTIONS } from '@/shared/constants'
import { toIsoLocalDay } from '@/shared/lib/date'
import { Button } from '@/shared/ui/button'
import { ClearableSelect } from '@/shared/ui/clearable-select'
import { DateField } from '@/shared/ui/date-field'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

import type { CreateProjectFormValues } from '../lib/create-project-form-values'
import { resolvePrimaryHallVenueIds } from '../lib/resolve-primary-hall-venue-ids'
import { useCreateProject } from '../model/use-create-project'

const TRIGGER_CLASS =
  'h-10! min-w-0 w-full rounded-[10px] border-border-strong bg-card data-placeholder:text-disabled-foreground'

const formSchema = z
  .object({
    title: z.string().trim().min(1, 'Введите название проекта').max(500, 'Не длиннее 500 символов'),
    eventType: z.string().min(1, 'Выберите тип мероприятия'),
    eventDate: z.string().min(1, 'Выберите дату мероприятия'),
    lofts: z.array(z.string()),
    halls: z.array(z.string()),
    magManagerId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.halls.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Выберите хотя бы один лофт',
        path: ['lofts'],
      })
    }
  }) satisfies z.ZodType<CreateProjectFormValues>

function getDefaultValues(): CreateProjectFormValues {
  return {
    title: '',
    eventType: '',
    eventDate: toIsoLocalDay(new Date()),
    lofts: [],
    halls: [],
    magManagerId: '',
  }
}

export interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const role = useUserRole()
  const isManagerRole = role === 'manager'

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  })

  const assignment = useLoftHallAssignment(form, { assigned: isManagerRole })

  const {
    create,
    isPending,
    isError,
    errorMessage,
    reset: resetMutation,
  } = useCreateProject({
    magManager: currentUser.fullName,
    magManagerId: Number(currentUser.id) || 0,
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
          <DialogTitle className="font-heading text-foreground">Новый проект</DialogTitle>
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
                      className="border-border-strong placeholder:text-disabled-foreground bg-card h-10! rounded-[10px]"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] grid-rows-[auto_auto_auto] gap-x-3 gap-y-1.5">
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem className="row-span-3 min-w-0 grid-rows-subgrid gap-1.5">
                    <FormLabel>Тип мероприятия</FormLabel>
                    <FormControl>
                      <div className="w-full min-w-0">
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
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem className="row-span-3 min-w-0 grid-rows-subgrid gap-1.5">
                    <FormLabel>Дата мероприятия</FormLabel>
                    <FormControl>
                      <div className="w-full min-w-0">
                        <DateField value={field.value} onChange={field.onChange} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <LoftHallAssignmentFields
              control={form.control}
              assignment={assignment}
              triggerClassName={TRIGGER_CLASS}
            />
            {!isManagerRole ? (
              <ManagerSelectField control={form.control} disabled={isPending} />
            ) : null}
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
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-[10px]"
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

interface ManagerSelectFieldProps {
  control: Control<CreateProjectFormValues>
  disabled?: boolean
}

/**
 * Выбор менеджера MAG руководителем/админом (mag_manager_id).
 * Вынесено в отдельный компонент, чтобы справочник менеджеров не запрашивался
 * для роли менеджера, у которой этого поля нет.
 */
function ManagerSelectField({ control, disabled = false }: ManagerSelectFieldProps) {
  const { setValue } = useFormContext<CreateProjectFormValues>()
  const selectedHalls = useWatch({ control, name: 'halls' })
  const { halls } = useVenueCatalog()

  const venueFilter = useMemo(
    () => resolvePrimaryHallVenueIds(selectedHalls ?? [], halls),
    [selectedHalls, halls],
  )

  const {
    selectOptions: managerOptions,
    isOptionsLoading: isManagersLoading,
    isError: isManagersError,
    showHallAssignmentHint,
  } = useManagersDirectory(venueFilter, { enabled: venueFilter !== undefined })

  const selectedManagerId = useWatch({ control, name: 'magManagerId' })

  useEffect(() => {
    if (!selectedManagerId) return
    if (!managerOptions.some((option) => option.id === selectedManagerId)) {
      setValue('magManagerId', '')
    }
  }, [managerOptions, selectedManagerId, setValue])

  const isDisabled = disabled || !venueFilter || isManagersLoading || isManagersError

  return (
    <FormField
      control={control}
      name="magManagerId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Менеджер MAG</FormLabel>
          <FormControl>
            <Select value={field.value || ''} onValueChange={field.onChange} disabled={isDisabled}>
              <SelectTrigger className={TRIGGER_CLASS}>
                <SelectValue placeholder="Авто (по залам)" />
              </SelectTrigger>
              <SelectContent>
                {managerOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          {isManagersError ? (
            <p className="text-destructive text-sm">Не удалось загрузить список менеджеров</p>
          ) : !venueFilter ? (
            <p className="text-muted-foreground text-sm">Сначала выберите зал проекта</p>
          ) : showHallAssignmentHint ? (
            <p className="text-muted-foreground text-sm">{MANAGER_HALL_ASSIGNMENT_HINT}</p>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
