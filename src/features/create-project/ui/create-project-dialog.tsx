import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useMemo } from 'react'
import type { Control } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useCurrentUser } from '@/entities/current-user'
import { useManagersDirectory } from '@/entities/manager'
import { DEFAULT_PROJECTS_BACK_ORIGIN } from '@/entities/project'
import { useUserRole } from '@/entities/user-role'
import {
  applyLoftSelection,
  buildFilteredHallGroups,
  buildLoftAssignmentOptions,
  syncLoftHallSelection,
  useVenueCatalog,
} from '@/entities/venue'
import { EVENT_TYPE_OPTIONS } from '@/shared/constants/event-type-options'
import { toIsoLocalDay } from '@/shared/lib/date/to-iso-local-day'
import { Button } from '@/shared/ui/button'
import { ClearableSelect } from '@/shared/ui/clearable-select'
import { DateField } from '@/shared/ui/date-field'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { keyedGroupsToMultiSelect, keyedOptionsToMultiSelect, MultiSelect } from '@/shared/ui/multi-select'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

import type { CreateProjectFormValues } from '../lib/create-project-form-values'
import { useCreateProject } from '../model/use-create-project'

const TRIGGER_CLASS =
  'h-10! min-w-0 w-full rounded-[10px] border-[#B1B1B1] bg-white data-placeholder:text-[#BCBCBC]'

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

  const {
    halls,
    lofts,
    isLoading: isVenueCatalogLoading,
    isError: isVenueCatalogError,
  } = useVenueCatalog(isManagerRole ? { assigned: true } : undefined)
  const selectDisabled = isVenueCatalogLoading || isVenueCatalogError

  const loftOptions = useMemo(
    () => keyedOptionsToMultiSelect(buildLoftAssignmentOptions(lofts)),
    [lofts],
  )
  const isSingleLoftSelect = lofts.length === 1

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  })

  const selectedHallValues = form.watch('halls')
  const hasHalls = selectedHallValues.length > 0

  const hallOptionGroups = useMemo(
    () => keyedGroupsToMultiSelect(buildFilteredHallGroups(halls, lofts, selectedHallValues.map(Number))),
    [halls, lofts, selectedHallValues],
  )

  const syncFromHalls = useCallback(
    (hallIds: number[]) => {
      const { hallIds: nextHallIds, loftIds } = syncLoftHallSelection(halls, hallIds)
      form.setValue('halls', nextHallIds.map(String), { shouldValidate: true })
      form.setValue('lofts', loftIds.map(String), { shouldValidate: true })
    },
    [form, halls],
  )

  const handleHallsChange = useCallback(
    (nextHallValues: string[]) => {
      syncFromHalls(nextHallValues.map(Number))
    },
    [syncFromHalls],
  )

  const handleLoftsChange = useCallback(
    (nextLoftValues: string[]) => {
      const currentHallIds = form.getValues('halls').map(Number)
      const nextHallIds = applyLoftSelection(halls, currentHallIds, nextLoftValues.map(Number))
      syncFromHalls(nextHallIds)
    },
    [form, halls, syncFromHalls],
  )

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
                      className="h-10! rounded-[10px] border-[#B1B1B1] bg-white placeholder:text-[#BCBCBC]"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Тип мероприятия</FormLabel>
                    <FormControl>
                      <div className="w-full min-w-0 self-end">
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
                  <FormItem className="min-w-0">
                    <FormLabel>Дата мероприятия</FormLabel>
                    <FormControl>
                      <div className="w-full min-w-0 self-end">
                        <DateField value={field.value} onChange={field.onChange} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {!isManagerRole ? (
              <ManagerSelectField control={form.control} disabled={isPending} />
            ) : null}
            <FormField
              control={form.control}
              name="lofts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Лофты</FormLabel>
                  <FormControl>
                    {isSingleLoftSelect ? (
                      <ClearableSelect
                        placeholder="Выберите лофт"
                        value={field.value[0] ?? null}
                        options={loftOptions}
                        onChange={(v) => handleLoftsChange(v ? [v] : [])}
                        triggerClassName={TRIGGER_CLASS}
                        disabled={selectDisabled}
                      />
                    ) : (
                      <MultiSelect
                        placeholder="Выберите лофты"
                        values={field.value}
                        options={loftOptions}
                        onChange={handleLoftsChange}
                        triggerClassName={TRIGGER_CLASS}
                        disabled={selectDisabled}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {hasHalls ? (
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
                        options={hallOptionGroups}
                        onChange={handleHallsChange}
                        triggerClassName={TRIGGER_CLASS}
                        disabled={selectDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
  const {
    selectOptions: managerOptions,
    isLoading: isManagersLoading,
    isError: isManagersError,
  } = useManagersDirectory()
  const isDisabled = disabled || isManagersLoading || isManagersError

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
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
